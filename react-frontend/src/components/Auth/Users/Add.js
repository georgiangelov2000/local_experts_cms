import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  password: yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
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
  workspaces: yup.array().of(yup.number()),
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
  projects: yup.array().of(
    yup.object().shape({
      name: yup.string().notRequired(),
      description: yup.string().notRequired(),
      link: yup.string().notRequired(),
    })
  ),
});

function UserAdd({ token }) {
  const navigate = useNavigate();
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [categories, setCategories] = useState([]);
  const [serviceCategories, setServiceCategories] = useState([]);
  const [cities, setCities] = useState([]);
  const [selectedWorkspaceCities, setSelectedWorkspaceCities] = useState([]);

  const { register, handleSubmit, setValue, watch, control, formState: { errors, isSubmitting } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      email: '',
      role_id: '',
      password: '',
      business_name: '',
      description: '',
      category_id: '',
      service_category_id: '',
      start_time: '',
      stop_time: '',
      alias: '',
      services: [],
      workspaces: [],
      certifications: [],
      contacts: [],
      projects: [],
    }
  });

  const { fields: serviceFields, append: appendService, remove: removeService } = useFieldArray({ control, name: 'services' });
  const { fields: certFields, append: appendCert, remove: removeCert } = useFieldArray({ control, name: 'certifications' });
  const { fields: projectFields, append: appendProject, remove: removeProject } = useFieldArray({ control, name: 'projects' });
  const { fields: contactFields, append: appendContact, remove: removeContact } = useFieldArray({ control, name: 'contacts' });

  const role_id = watch('role_id');

  useEffect(() => {
    fetchCategories(token).then(setCategories);
    fetchServiceCategories(token).then(setServiceCategories);
    // Fetch cities from API (use /users/1 as a hack to get cities list)
    fetch(`${API_BASE}/users/1`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.json())
      .then(data => {
        if (data.cities) setCities(data.cities);
      });
  }, [token]);

  const handleWorkspaceCitiesChange = (selectedOptions) => {
    setSelectedWorkspaceCities(selectedOptions);
    setValue('workspaces', selectedOptions.map(opt => opt.value));
  };

  const cityOptions = cities.map(city => ({ value: city.id, label: city.name }));

  const onSubmit = async (formData) => {
    setError('');
    setSuccess('');
    try {
      const res = await fetch(`${API_BASE}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess('User created successfully!');
        setTimeout(() => navigate('/users'), 1200);
      } else {
        setError(data.message || 'Failed to create user');
      }
    } catch (e) {
      setError('Network error');
    }
  };

  return (
    <div className="flex justify-center items-start py-8 bg-gray-50 min-h-screen">
      <Card className="w-full shadow-lg border border-gray-200">
        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6">
          <div className="col-span-2 mb-2 flex items-center gap-4 border-b pb-4">
            <h2 className="text-2xl font-bold">Add User</h2>
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
                <option value="">Select Role</option>
                <option value={1}>Admin</option>
                <option value={2}>Service Provider</option>
                <option value={3}>User</option>
              </Select>
              {errors.role_id && <span className="text-xs text-red-600">{errors.role_id.message}</span>}
            </div>
            <div className="mb-3">
              <label className="block text-sm font-medium mb-1">Password</label>
              <TextInput type="password" {...register('password')} autoComplete="new-password" color={errors.password ? 'failure' : undefined} />
              {errors.password && <span className="text-xs text-red-600">{errors.password.message}</span>}
            </div>
          </div>

          {/* Contacts Section */}
          <div className="col-span-2 md:col-span-1 bg-white rounded-lg p-4 border border-gray-100 shadow-sm">
            <h3 className="font-semibold text-lg mb-3 border-b pb-1">Contacts</h3>
            <div className="space-y-2">
              {contactFields.map((field, idx) => (
                <div key={field.id} className="flex flex-wrap gap-2 items-center mb-2">
                  <TextInput placeholder="Phone" {...register(`contacts.${idx}.phone`)} className="flex-1" />
                  <TextInput placeholder="Email" {...register(`contacts.${idx}.email`)} className="flex-1" />
                  <TextInput placeholder="Address" {...register(`contacts.${idx}.address`)} className="flex-1" />
                  <TextInput placeholder="Website" {...register(`contacts.${idx}.website`)} className="flex-1" />
                  <TextInput placeholder="Facebook" {...register(`contacts.${idx}.facebook`)} className="flex-1" />
                  <TextInput placeholder="Instagram" {...register(`contacts.${idx}.instagram`)} className="flex-1" />
                  <Button color="failure" size="xs" type="button" onClick={() => removeContact(idx)}>Delete</Button>
                </div>
              ))}
              <Button color="info" size="xs" type="button" onClick={() => appendContact({})}>Add Contact</Button>
            </div>
          </div>

          {/* Service Provider Section */}
          {Number(role_id) === 2 && (
            <div className="col-span-2 bg-white rounded-lg p-4 border border-gray-100 shadow-sm mt-4">
              <h3 className="font-semibold text-lg mb-3 border-b pb-1 flex items-center gap-2">Provider Information</h3>
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
              {/* Services */}
              <div className="mt-6">
                <h4 className="font-semibold mb-2">Services</h4>
                <div className="space-y-2">
                  {serviceFields.map((field, idx) => (
                    <div key={field.id} className="flex flex-wrap gap-2 items-center">
                      <TextInput placeholder="Description" {...register(`services.${idx}.description`)} className="flex-1" />
                      <TextInput placeholder="Price" type="number" {...register(`services.${idx}.price`)} className="w-32" />
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
                      <TextInput placeholder="Project Name" {...register(`projects.${idx}.name`)} className="flex-1" />
                      <TextInput placeholder="Project Description" {...register(`projects.${idx}.description`)} className="flex-1" />
                      <TextInput placeholder="Project Link" {...register(`projects.${idx}.link`)} className="flex-1" />
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
                      <TextInput placeholder="Name" {...register(`certifications.${idx}.name`)} className="flex-1" />
                      <TextInput placeholder="Description" {...register(`certifications.${idx}.description`)} className="flex-1" />
                      <TextInput placeholder="Link" {...register(`certifications.${idx}.link`)} className="flex-1" />
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
            <Button type="submit" isProcessing={isSubmitting} disabled={isSubmitting} color="primary">Create</Button>
            <Button color="light" type="button" onClick={() => navigate(-1)}>Cancel</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

export default UserAdd; 