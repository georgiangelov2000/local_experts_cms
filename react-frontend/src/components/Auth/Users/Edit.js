import { useQuery, useMutation } from '@tanstack/react-query';
import { fetchUser } from '../../../api/user';
import { useParams } from 'react-router-dom';
import { useProviderSchema } from '../../../models/userSchema';
import { Card, Spinner, TextInput, Select, Button } from 'flowbite-react';
import { useEffect } from 'react';
import { useFieldArray } from 'react-hook-form';

function Edit({ token }) {
  const { id } = useParams();

  // Fetch user data
  const { data: userObject, isLoading } = useQuery({
    queryKey: ['user', id],
    queryFn: () => fetchUser(token, id),
    enabled: !!token && !!id,
  });

  // Initialize form hook
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors }
  } = useProviderSchema();

  // Dynamic field arrays
  const { fields: serviceFields, append: addService, remove: removeService } = useFieldArray({
    control,
    name: 'services'
  });

  const { fields: contactFields, append: addContact, remove: removeContact } = useFieldArray({
    control,
    name: 'contacts'
  });

  const { fields: workspaceFields, append: addWorkspace, remove: removeWorkspace } = useFieldArray({
    control,
    name: 'workspaces'
  });

  const { fields: certificationFields, append: addCertification, remove: removeCertification } = useFieldArray({
    control,
    name: 'certifications'
  });

  const { fields: projectFields, append: addProject, remove: removeProject } = useFieldArray({
    control,
    name: 'projects'
  });



  // Reset form when data is loaded
  useEffect(() => {
    if (userObject?.user) {
      const u = userObject.user;
      const defaultValues = {
        email: u.email || '',
        role_id: u.role_id || '',
        business_name: u.service_provider?.business_name || '',
        description: u.service_provider?.description || '',
        category_id: u.service_provider?.category_id || null,
        service_category_id: u.service_provider?.service_category_id || null,
        start_time: u.start_time || '',
        stop_time: u.stop_time || '',
        alias: u.alias || '',
        services: u.service_provider.services || [{ description: '', price: '' }],
        workspaces: userObject.cities || [{ id: null, city_id: null }],
        certifications: u.service_provider.certifications || [{ name: '', description: '', link: '' }],
        projects: u.service_provider.projects || [],
        contacts: u.contacts || [{ phone: '', email: '' }],
      };
      reset(defaultValues);
    }
  }, [userObject, reset]);

  // Mutation for update
  const updateUserMutation = useMutation({
    mutationFn: async (formData) => {
      const res = await fetch(`/api/users/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      if (!res.ok) throw new Error('Update failed');
      return res.json();
    },
    onSuccess: () => alert('Updated successfully'),
    onError: (err) => alert(`Error: ${err.message}`)
  });

  const onSubmit = (data) => {
    console.log('Submitting:', data);
    updateUserMutation.mutate(data);
  };

  // Loading state
  if (isLoading) {
    return <div className="flex justify-center items-center h-64"><Spinner /></div>;
  }

  if (!userObject?.user) {
    return <div className="text-center text-gray-500">User not found.</div>;
  }

  return (
    <Card className="w-full shadow-lg border border-gray-200">
      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 gap-6 p-6">
        <h2 className="text-2xl font-bold mb-2">Edit User #{userObject.user.id}</h2>

        {/* Email */}
        <div>
          <label>Email</label>
          <TextInput type="email" {...register('email')} />
          {errors?.email && <p className="text-red-500 text-xs">{errors.email.message}</p>}
        </div>

        {/* Role */}
        <div>
          <label>Role</label>
          <Select {...register('role_id')}>
            <option value={1}>Admin</option>
            <option value={2}>Service Provider</option>
            <option value={3}>User</option>
          </Select>
        </div>

        {/* Provider fields */}
        {userObject.user.role_id === 2 && (
          <>
            <div>
              <label>Business Name</label>
              <TextInput {...register('business_name')} />
            </div>
            <div>
              <label>Description</label>
              <TextInput {...register('description')} />
            </div>

            {/* Dynamic Services */}
            <div>
              <h3 className="font-semibold mb-2">Services</h3>
              {serviceFields.map((field, index) => (
                <div key={field.id} className="flex gap-2 mb-2">
                  <TextInput {...register(`services.${index}.description`)} placeholder="Description" />
                  <TextInput type="number" {...register(`services.${index}.price`)} placeholder="Price" />
                  <Button color="failure" onClick={() => removeService(index)}>X</Button>
                </div>
              ))}
              <Button type="button" onClick={() => addService({ description: '', price: '' })}>
                + Add Service
              </Button>
            </div>

            {/* Dynamic Certifications */}
            <div>
              <h3 className="font-semibold mb-2">Certifications</h3>
              {certificationFields.map((field, index) => (
                <div key={field.id} className="flex gap-2 mb-2">
                  <TextInput {...register(`certifications.${index}.name`)} placeholder="Certification Name" />
                  <TextInput {...register(`certifications.${index}.description`)} placeholder="Description" />
                  <TextInput {...register(`certifications.${index}.link`)} placeholder="Link" />
                  <Button color="failure" onClick={() => removeCertification(index)}>X</Button>
                </div>
              ))}
              <Button type="button" onClick={() => addCertification({ name: '', description: '', link: '' })}>
                + Add Certification
              </Button>
            </div>

            {/* Dynamic Projects */}
            <div>
              <h3 className="font-semibold mb-2">Projects</h3>
              {projectFields.map((field, index) => (
                <div key={field.id} className="flex gap-2 mb-2">
                  <TextInput {...register(`projects.${index}.project_name`)} placeholder="Project Name" />
                  <TextInput {...register(`projects.${index}.description`)} placeholder="Description" />
                  <TextInput {...register(`projects.${index}.link`)} placeholder="Link" />
                  <Button color="failure" onClick={() => removeProject(index)}>X</Button>
                </div>
              ))}
              <Button type="button" onClick={() => addProject({ name: '', description: '', link: '' })}>
                + Add Project
              </Button>
            </div>

            {/* Dynamic Contacts */}
            <div>
              <h3 className="font-semibold mb-2">Contacts</h3>
              {contactFields.map((field, index) => (
                <div key={field.id} className="flex gap-2 mb-2">
                  <TextInput {...register(`contacts.${index}.phone`)} placeholder="Phone" />
                  <TextInput {...register(`contacts.${index}.email`)} placeholder="Email" />
                  <Button color="failure" onClick={() => removeContact(index)}>X</Button>
                </div>
              ))}
              <Button type="button" onClick={() => addContact({ phone: '', email: '' })}>
                + Add Contact
              </Button>
            </div>
          </>
        )}

        {/* Submit Button */}
        <Button type="submit" className="mt-4">
          {updateUserMutation.isLoading ? 'Updating...' : 'Update User'}
        </Button>
        {updateUserMutation.isError && <p className="text-red-500 mt-2">{updateUserMutation.error.message}</p>}
        {updateUserMutation.isSuccess && <p className="text-green-500 mt-2">User updated successfully!</p>}
      </form>
    </Card>
  );
}

export default Edit;
