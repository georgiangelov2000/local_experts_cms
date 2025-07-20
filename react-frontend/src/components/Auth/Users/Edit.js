/**
 * This edit form renders all fields from the provided user object, including all service provider fields, media, reviews, workspaces, projects, services, certifications, and contacts.
 * Arrays are rendered as lists. Use selects for category/service_category by id.
 */
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Spinner, Button, Select, TextInput, Textarea, Alert } from 'flowbite-react';
import { useForm, useFieldArray } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { fetchCategories, fetchServiceCategories } from '../../../api/filters';
import ReactSelect from 'react-select';

const API_BASE = 'http://localhost:81/api/v1';

const schema = yup.object().shape({
  email: yup.string().email('Invalid email').required('Email is required'),
  role_id: yup.number().oneOf([1, 2, 3], 'Invalid role').required('Role is required'),
  password: yup.string().min(6, 'Password must be at least 6 characters').notRequired(),
  business_name: yup.string().notRequired(),
  description: yup.string().notRequired(),
  category_id: yup.number().notRequired(),
  service_category_id: yup.number().notRequired(),
  start_time: yup.string().notRequired(),
  stop_time: yup.string().notRequired(),
  alias: yup.string().notRequired(),
  services: yup.array().of(
    yup.object().shape({
      description: yup.string().notRequired(),
      price: yup.number().notRequired(),
    })
  ),
  workspaces: yup.array().of(
    yup.object().shape({
      id: yup.number().notRequired(),
      city_id: yup.number().notRequired(),
    })
  ),
  certifications: yup.array().of(
    yup.object().shape({
      name: yup.string().notRequired(),
      description: yup.string().notRequired(),
      link: yup.string().notRequired(),
    })
  ),
  contacts: yup.array().of(
    yup.object().shape({
      phone: yup.string().notRequired(),
      email: yup.string().notRequired(),
      address: yup.string().notRequired(),
      website: yup.string().notRequired(),
      facebook: yup.string().notRequired(),
      instagram: yup.string().notRequired(),
    })
  ),
});

function UserEdit({ token }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [categories, setCategories] = useState([]);
  const [serviceCategories, setServiceCategories] = useState([]);
  const [cities, setCities] = useState([]);
  const [selectedWorkspaceCities, setSelectedWorkspaceCities] = useState([]);

  const { register, handleSubmit, setValue, watch, control, formState: { errors, isSubmitting } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      services: [],
      workspaces: [],
      certifications: [],
      contacts: [],
      projects: [],
    }
  });

  const { fields: serviceFields, append: appendService, remove: removeService } = useFieldArray({ control, name: 'services' });
  const { fields: workspaceFields, append: appendWorkspace, remove: removeWorkspace } = useFieldArray({ control, name: 'workspaces' });
  const { fields: certFields, append: appendCert, remove: removeCert } = useFieldArray({ control, name: 'certifications' });
  const { fields: projectFields, append: appendProject, remove: removeProject } = useFieldArray({ control, name: 'projects' });
  const { fields: contactFields, append: appendContact, remove: removeContact } = useFieldArray({ control, name: 'contacts' });

  const role_id = watch('role_id');

  useEffect(() => {
    fetchCategories(token).then(setCategories);
    fetchServiceCategories(token).then(setServiceCategories);
  }, [token]);

  useEffect(() => {
    fetch(`${API_BASE}/users/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => {
        setUser(data.data || null);
        setLoading(false);
        if (data.data) {
          setValue('email', data.data.email);
          setValue('role_id', data.data.role_id);
          setValue('contacts', data.data.contacts || []);
          if (data.data.role_id === 2 && data.data.service_provider) {
            const sp = data.data.service_provider;
            setValue('business_name', sp.business_name || '');
            setValue('description', sp.description || '');
            setValue('category_id', sp.category?.id || '');
            setValue('service_category_id', sp.service_category?.id || '');
            setValue('start_time', sp.start_time || '');
            setValue('stop_time', sp.stop_time || '');
            setValue('alias', sp.alias || '');
            setValue('services', sp.services || []);
            setValue('projects', sp.projects || []);
            setValue('certifications', sp.certifications || []);
            // Set selected workspace cities for react-select
            if (sp.workspaces && Array.isArray(sp.workspaces)) {
              const cityIds = sp.workspaces.map(w => w.city_id).filter(Boolean);
              setSelectedWorkspaceCities(cityIds.map(id => ({ value: id, label: (data.cities?.find(c => c.id === id)?.name) || id })));
              setValue('workspaces', cityIds);
            }
          }
        }
        if (data.cities) {
          setCities(data.cities);
        }
      });
  }, [id, token, setValue]);

  // Handler for react-select workspaces
  const handleWorkspaceCitiesChange = (selectedOptions) => {
    setSelectedWorkspaceCities(selectedOptions);
    setValue('workspaces', selectedOptions.map(opt => opt.value));
  };

  const cityOptions = cities.map(city => ({ value: city.id, label: city.name }));

  const onSubmit = async (formData) => {
    setError('');
    setSuccess('');
    try {
      const res = await fetch(`${API_BASE}/users/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess('User updated successfully!');
        setUser(data.data);
        setValue('password', '');
      } else {
        setError(data.message || 'Failed to update user');
      }
    } catch (e) {
      setError('Network error');
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64"><Spinner /></div>;
  }

  if (!user) {
    return <div className="text-center text-gray-500">User not found.</div>;
  }

  // Helper for avatar
  const userAvatar = user.media && user.media.length > 0 ? (user.media[0].file_url || `/storage/${user.media[0].file_path}`) : null;
  const providerAvatar = user.service_provider && user.service_provider.media && user.service_provider.media.length > 0 ? (user.service_provider.media[0].file_url || `/storage/${user.service_provider.media[0].file_path}`) : null;

  return (
    <div className="flex justify-center items-start py-8 bg-gray-50 min-h-screen">
      <Card className="w-full shadow-lg border border-gray-200">
        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6">
          {/* User Info Section */}
          <div className="col-span-2 mb-2 flex items-center gap-4 border-b pb-4">
            <div className="relative">
              <img
                src={userAvatar || providerAvatar || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user.email)}
                alt="User Avatar"
                className="w-20 h-20 rounded-full border object-cover bg-white"
              />
              {providerAvatar && (
                <span className="absolute -bottom-2 -right-2 bg-white rounded-full p-1 border">
                  <img src={providerAvatar} alt="Provider Avatar" className="w-8 h-8 rounded-full object-cover" />
                </span>
              )}
            </div>
            <div>
              <h2 className="text-2xl font-bold">Edit User #{user.id}</h2>
              <div className="text-gray-500 text-sm">{user.email}</div>
            </div>
          </div>
          {success && <Alert color="success" className="col-span-2 mb-2">{success}</Alert>}
          {error && <Alert color="failure" className="col-span-2 mb-2">{error}</Alert>}

          {/* User Details */}
          <div className="col-span-2 md:col-span-1 bg-white rounded-lg p-4 border border-gray-100 shadow-sm">
            <h3 className="font-semibold text-lg mb-3 border-b pb-1">User Information</h3>
            <div className="mb-3">
              <label className="block text-sm font-medium mb-1">Email</label>
              <TextInput type="email" {...register('email')} color={errors.email ? 'failure' : undefined} />
              {errors.email && <span className="text-xs text-red-600">{errors.email.message}</span>}
            </div>
            <div className="mb-3">
              <label className="block text-sm font-medium mb-1">Role</label>
              <Select {...register('role_id')} color={errors.role_id ? 'failure' : undefined}>
                <option value={1}>Admin</option>
                <option value={2}>Service Provider</option>
                <option value={3}>User</option>
              </Select>
              {errors.role_id && <span className="text-xs text-red-600">{errors.role_id.message}</span>}
            </div>
            <div className="mb-3">
              <label className="block text-sm font-medium mb-1">Password (leave blank to keep unchanged)</label>
              <TextInput type="password" {...register('password')} autoComplete="new-password" color={errors.password ? 'failure' : undefined} />
              {errors.password && <span className="text-xs text-red-600">{errors.password.message}</span>}
            </div>
            <div className="mb-3">
              <label className="block text-sm font-medium mb-1">Email Verified</label>
              <TextInput value={user.email_verified_at ? 'Yes' : 'No'} disabled />
            </div>
            <div className="mb-3">
              <label className="block text-sm font-medium mb-1">Created At</label>
              <TextInput value={user.created_at} disabled />
            </div>
            <div className="mb-3">
              <label className="block text-sm font-medium mb-1">Updated At</label>
              <TextInput value={user.updated_at} disabled />
            </div>
            <div className="mb-3">
              <label className="block text-sm font-medium mb-1">Last Logged In</label>
              <TextInput value={user.last_logged_in || ''} disabled />
            </div>
          </div>

          {/* Contacts Section */}
          <div className="col-span-2 md:col-span-1 bg-white rounded-lg p-4 border border-gray-100 shadow-sm">
            <h3 className="font-semibold text-lg mb-3 border-b pb-1">Contacts</h3>
            <div className="space-y-2">
              {contactFields.map((field, idx) => (
                <div key={field.id} className="flex flex-wrap gap-2 items-center mb-2">
                  <TextInput placeholder="Phone" {...register(`contacts.${idx}.phone`)} defaultValue={field.phone} className="flex-1" />
                  <TextInput placeholder="Email" {...register(`contacts.${idx}.email`)} defaultValue={field.email} className="flex-1" />
                  <TextInput placeholder="Address" {...register(`contacts.${idx}.address`)} defaultValue={field.address} className="flex-1" />
                  <TextInput placeholder="Website" {...register(`contacts.${idx}.website`)} defaultValue={field.website} className="flex-1" />
                  <TextInput placeholder="Facebook" {...register(`contacts.${idx}.facebook`)} defaultValue={field.facebook} className="flex-1" />
                  <TextInput placeholder="Instagram" {...register(`contacts.${idx}.instagram`)} defaultValue={field.instagram} className="flex-1" />
                  <Button color="failure" size="xs" type="button" onClick={() => removeContact(idx)}>Delete</Button>
                </div>
              ))}
              <Button color="info" size="xs" type="button" onClick={() => appendContact({})}>Add Contact</Button>
            </div>
          </div>

          {/* Service Provider Section */}
          {Number(role_id) === 2 && user.service_provider && (
            <div className="col-span-2 bg-white rounded-lg p-4 border border-gray-100 shadow-sm mt-4">
              <h3 className="font-semibold text-lg mb-3 border-b pb-1 flex items-center gap-2">
                Provider Information
                {providerAvatar && (
                  <img src={providerAvatar} alt="Provider Avatar" className="w-8 h-8 rounded-full object-cover border ml-2" />
                )}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Business Name</label>
                  <TextInput {...register('business_name')} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <Textarea {...register('description')} rows={2} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Category</label>
                  <Select {...register('category_id')}>
                    <option value="">Select category</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Service Category</label>
                  <Select {...register('service_category_id')}>
                    <option value="">Select service category</option>
                    {serviceCategories.map(sc => (
                      <option key={sc.id} value={sc.id}>{sc.name}</option>
                    ))}
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Start Time</label>
                  <TextInput type="datetime-local" {...register('start_time')} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Stop Time</label>
                  <TextInput type="datetime-local" {...register('stop_time')} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Alias</label>
                  <TextInput {...register('alias')} />
                </div>
              </div>
              {/* Provider Media Gallery */}
              {user.service_provider.media && user.service_provider.media.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-semibold mb-2">Provider Images</h4>
                  <div className="flex flex-wrap gap-2">
                    {user.service_provider.media.map(m => (
                      <img
                        key={m.id}
                        src={m.file_url || `/storage/${m.file_path}`}
                        alt={m.file_name}
                        className="w-20 h-20 object-cover rounded border"
                      />
                    ))}
                  </div>
                </div>
              )}
              {/* Services */}
              <div className="mt-6">
                <h4 className="font-semibold mb-2">Services</h4>
                <div className="space-y-2">
                  {serviceFields.map((field, idx) => (
                    <div key={field.id} className="flex flex-wrap gap-2 items-center">
                      <TextInput placeholder="Description" {...register(`services.${idx}.description`)} defaultValue={field.description} className="flex-1" />
                      <TextInput placeholder="Price" type="number" {...register(`services.${idx}.price`)} defaultValue={field.price} className="w-32" />
                      <Button color="failure" size="xs" type="button" onClick={() => removeService(idx)}>Delete</Button>
                    </div>
                  ))}
                  <Button color="info" size="xs" type="button" onClick={() => appendService({ description: '', price: '' })}>Add Service</Button>
                </div>
              </div>
              {/* Workspaces */}
              <div className="mt-6">
                <h4 className="font-semibold mb-2">Workspaces (Cities)</h4>
                <ReactSelect
                  isMulti
                  options={cityOptions}
                  value={selectedWorkspaceCities}
                  onChange={handleWorkspaceCitiesChange}
                  className="w-full"
                  classNamePrefix="react-select"
                  placeholder="Select cities..."
                />
                <div className="text-xs text-gray-500 mt-1">You can select multiple cities for workspaces.</div>
              </div>
              {/* Projects */}
              <div className="mt-6">
                <h4 className="font-semibold mb-2">Projects</h4>
                <div className="space-y-2">
                  {projectFields.map((project, idx) => (
                    <div key={idx} className="flex flex-wrap gap-2 items-center">
                      <TextInput placeholder="Project Name" {...register(`projects.${idx}.name`)} defaultValue={project.name} className="flex-1" />
                      <TextInput placeholder="Project Description" {...register(`projects.${idx}.description`)} defaultValue={project.description} className="flex-1" />
                      <TextInput placeholder="Project Link" {...register(`projects.${idx}.link`)} defaultValue={project.link} className="flex-1" />
                      <Button color="failure" size="xs" type="button" onClick={() => removeProject(idx)}>Delete</Button>
                    </div>
                  ))}
                  <Button color="info" size="xs" type="button" onClick={() => appendProject({ name: '', description: '', link: '' })}>Add Project</Button>
                </div>
              </div>
              {/* Certifications */}
              <div className="mt-6">
                <h4 className="font-semibold mb-2">Certifications</h4>
                <div className="space-y-2">
                  {certFields.map((field, idx) => (
                    <div key={field.id} className="flex flex-wrap gap-2 items-center">
                      <TextInput placeholder="Name" {...register(`certifications.${idx}.name`)} defaultValue={field.name} className="flex-1" />
                      <TextInput placeholder="Description" {...register(`certifications.${idx}.description`)} defaultValue={field.description} className="flex-1" />
                      <TextInput placeholder="Link" {...register(`certifications.${idx}.link`)} defaultValue={field.link} className="flex-1" />
                      <Button color="failure" size="xs" type="button" onClick={() => removeCert(idx)}>Delete</Button>
                    </div>
                  ))}
                  <Button color="info" size="xs" type="button" onClick={() => appendCert({ name: '', description: '', link: '' })}>Add Certification</Button>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="col-span-2 flex justify-end gap-2 mt-8">
            <Button type="submit" isProcessing={isSubmitting} disabled={isSubmitting} color="primary">Save</Button>
            <Button color="light" type="button" onClick={() => navigate(-1)}>Cancel</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

export default UserEdit; 