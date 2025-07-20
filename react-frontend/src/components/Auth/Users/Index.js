import React, { useEffect, useState } from 'react';
import { fetchUsersPaginated } from '../../../api/users';
import { fetchCategories, fetchServiceCategories, fetchWorkstations, fetchServices } from '../../../api/filters';
import { Button, Select, TextInput, Card, Pagination, RangeSlider, Avatar } from 'flowbite-react';
import { Link } from 'react-router-dom';

function UsersIndex({ token }) {
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [roleFilter, setRoleFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [serviceCategoryFilter, setServiceCategoryFilter] = useState('');
  const [workstationFilter, setWorkstationFilter] = useState('');
  const [serviceFilter, setServiceFilter] = useState('');
  const [ratingFilter, setRatingFilter] = useState('');
  const [search, setSearch] = useState('');
  const [categories, setCategories] = useState([]);
  const [serviceCategories, setServiceCategories] = useState([]);
  const [workstations, setWorkstations] = useState([]);
  const [services, setServices] = useState([]);
  const pageSize = 10;

  // Fetch filter options on mount
  useEffect(() => {
    fetchCategories(token).then(setCategories);
    fetchServiceCategories(token).then(setServiceCategories);
    fetchWorkstations(token).then(setWorkstations);
    fetchServices(token).then(setServices);
  }, [token]);

  // Server-side filtering: send all filters as query params
  useEffect(() => {
    const filters = {
      role: roleFilter,
      category: categoryFilter,
      service_category: serviceCategoryFilter,
      workstation: workstationFilter,
      service: serviceFilter,
      rating_min: ratingFilter,
      rating_max: 5, // Assuming max rating is 5
      search,
    };
    fetchUsersPaginated(token, page, pageSize, filters).then(data => {
      setUsers(data.data || []);
      setTotal(data.recordsTotal || 0);
    });
  }, [token, page, roleFilter, categoryFilter, serviceCategoryFilter, workstationFilter, serviceFilter, ratingFilter, search]);

  const totalPages = Math.ceil(total / pageSize);

  // Placeholder action handlers
  const handleView = (user) => alert(`View user ${user.id}`);
  const handleEdit = (user) => alert(`Edit user ${user.id}`);
  const handleDelete = (user) => {
    if (window.confirm(`Delete user ${user.id}?`)) {
      alert('Delete logic here');
    }
  };

  return (
    <Card>
      <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4 flex-wrap">
        <h2 className="text-2xl font-bold flex-1">Users</h2>
        <Select className="md:w-48" value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
          <option value="">All Roles</option>
          <option value="1">Admin</option>
          <option value="2">Service Provider</option>
          <option value="3">User</option>
        </Select>
        <Select className="md:w-48" value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
          <option value="">All Categories</option>
          {categories.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </Select>
        <Select className="md:w-48" value={serviceCategoryFilter} onChange={e => setServiceCategoryFilter(e.target.value)}>
          <option value="">All Service Categories</option>
          {serviceCategories.map(sc => (
            <option key={sc.id} value={sc.id}>{sc.name}</option>
          ))}
        </Select>
        <Select className="md:w-48" value={workstationFilter} onChange={e => setWorkstationFilter(e.target.value)}>
          <option value="">All Workspaces</option>
          {workstations.map(ws => (
            <option key={ws.id} value={ws.id}>{ws.name}</option>
          ))}
        </Select>
        <Select
          className="md:w-32"
          value={ratingFilter}
          onChange={e => setRatingFilter(e.target.value)}
        >
          <option value="">All Ratings</option>
          <option value="1">1+</option>
          <option value="2">2+</option>
          <option value="3">3+</option>
          <option value="4">4+</option>
          <option value="5">5</option>
        </Select>
        <TextInput
          className="md:w-64"
          placeholder="Search by email or business name..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <Button color="success" as={Link} to="/users/add">Add User</Button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400 border rounded-lg">
          <thead className="text-xs uppercase bg-gray-100 dark:bg-gray-700 dark:text-gray-400">
            <tr>
              <th className="px-4 py-3">ID</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Email Verified</th>
              <th className="px-4 py-3">Last Logged In</th>
              <th className="px-4 py-3">Avatar</th>
              <th className="px-4 py-3">Rating</th>
              <th className="px-4 py-3">Business Name</th>
              <th className="px-4 py-3">Service Category</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Workspaces</th>
              <th className="px-4 py-3">Start Date</th>
              <th className="px-4 py-3">End Date</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan={12} className="text-center py-6 text-gray-400">No users found.</td>
              </tr>
            ) : (
              users.map(user => {
                let mediaUrl = null;
                if (user.media) {
                  mediaUrl = user.media
                }
                return (
                  <tr key={user.id} className="bg-white border-b hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700">
                    <td className="px-4 py-2">{user.id}</td>
                    <td className="px-4 py-2">{user.email}</td>
                    <td className="px-4 py-2">{user.role_id === 1 ? 'Admin' : user.role_id === 2 ? 'Service Provider' : 'User'}</td>
                    <td className="px-4 py-2">{user.email_verified_at ? 'Yes' : 'No'}</td>
                    <td className="px-4 py-2">{user.last_logged_in ? new Date(user.last_logged_in).toLocaleString() : '-'}</td>
                    <td className="px-4 py-2">{mediaUrl ? <Avatar img={mediaUrl} size="md" rounded /> : '-'}</td>
                    <td className="px-4 py-2">{user.role_id === 2 && user.service_provider ?  user.service_provider.rating.toFixed(1) : '-'}</td>
                    {/* Service Provider Details Only for Service Providers */}
                    <td className="px-4 py-2">{user.role_id === 2 && user.service_provider ? user.service_provider.business_name : '-'}</td>
                    <td className="px-4 py-2">{user.role_id === 2 && user.service_provider ? user.service_provider.service_category : '-'}</td>
                    <td className="px-4 py-2">{user.role_id === 2 && user.service_provider ? user.service_provider.category : '-'}</td>
                    <td className="px-4 py-2">{user.role_id === 2 && user.service_provider ? user.service_provider.workspaces : '-'}</td>
                    <td className="px-4 py-2">{user.role_id === 2 && user.service_provider ? user.service_provider.start_date : '-'}</td>
                    <td className="px-4 py-2">{user.role_id === 2 && user.service_provider ? user.service_provider.end_date : '-'}</td>
                    <td className="px-4 py-2 flex gap-2">
                      <Button size="xs" color="info" onClick={() => handleView(user)}>View</Button>
                      <Button
                        as={Link}
                        to={`/users/${user.id}/edit`}
                        size="xs"
                        color="warning"
                      >
                        Edit
                      </Button>
                      {user.role_id !== 1 && (
                        <Button size="xs" color="failure" onClick={() => handleDelete(user)}>Delete</Button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      {/* Pagination Controls */}
      <div className="flex justify-between items-center mt-4">
        <span className="text-sm text-gray-600">
          Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, total)} of {total} users
        </span>
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
          showIcons
        />
      </div>
    </Card>
  );
}

export default UsersIndex;