import React, { useEffect, useState } from 'react';
import { fetchUsersPaginated } from '../../../api/users';
import config from '../../../config';
import {
  fetchCategories,
  fetchServiceCategories,
  fetchWorkstations,
  fetchServices,
} from '../../../api/filters';
import {
  Button,
  Card,
  Pagination,
  Avatar,
  Modal,
  Spinner,
} from 'flowbite-react';
import { Link } from 'react-router-dom';
import { Filters } from './Filters';

export function UsersIndex({ token }) {
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState({
    role: '',
    category: '',
    serviceCategory: '',
    workstation: '',
    service: '',
    rating: '',
    search: '',
  });
  const [categories, setCategories] = useState([]);
  const [serviceCategories, setServiceCategories] = useState([]);
  const [workstations, setWorkstations] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const pageSize = 10;

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  // Fetch filter options on mount
  useEffect(() => {
    Promise.all([
      fetchCategories(token),
      fetchServiceCategories(token),
      fetchWorkstations(token),
      // fetchServices(token),
    ])
      .then(([cats, scs, ws, srv]) => {
        setCategories(cats);
        setServiceCategories(scs);
        setWorkstations(ws);
        // setServices(srv);
      })
      .catch(() => setError('Failed to load filter data.'));
  }, [token]);

  // Fetch users whenever page or filters change
  useEffect(() => {
    setLoading(true);
    const queryFilters = {
      role: filters.role,
      category: filters.category,
      service_category: filters.serviceCategory,
      workstation: filters.workstation,
      service: filters.service,
      rating_min: filters.rating,
      rating_max: 5,
      search: filters.search,
    };
    fetchUsersPaginated(token, page, pageSize, queryFilters)
      .then((data) => {
        setUsers(data.data || []);
        setTotal(data.recordsTotal || 0);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load users.');
        setLoading(false);
      });
  }, [token, page, filters]);

  const totalPages = Math.ceil(total / pageSize);

  // Delete user API call
  async function deleteUser(userId) {
    try {
      const res = await fetch(`${config.API_BASE}/providers/${userId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to delete user');
      setUsers((prev) => prev.filter((u) => u.id !== userId));
    } catch (err) {
      setError('Error deleting user: ' + err.message);
    }
  }

  const handleDelete = (user) => {
    setUserToDelete(user);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (userToDelete) {
      await deleteUser(userToDelete.id);
      setShowDeleteModal(false);
      setUserToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setUserToDelete(null);
  };

  return (
    <Card>
      <Filters
        categories={categories}
        serviceCategories={serviceCategories}
        workstations={workstations}
        filters={filters}
        onChange={setFilters}
      />

      {loading ? (
        <div className="flex justify-center py-8">
          <Spinner size="xl" />
        </div>
      ) : error ? (
        <div className="text-center text-red-500">{error}</div>
      ) : (
        <>
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
                    <td colSpan={14} className="text-center py-6 text-gray-400">
                      No users found.
                    </td>
                  </tr>
                ) : (
                  users.map((user) => {
                    const sp = user.role_id === 2 ? user.service_provider : null;
                    const avatar = user.media?.url || null;
                    return (
                      <tr
                        key={user.id}
                        className="bg-white border-b hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700"
                      >
                        <td className="px-4 py-2">{user.id}</td>
                        <td className="px-4 py-2">{user.email}</td>
                        <td className="px-4 py-2">
                          {user.role_id === 1
                            ? 'Admin'
                            : user.role_id === 2
                            ? 'Service Provider'
                            : 'User'}
                        </td>
                        <td className="px-4 py-2">
                          {user.email_verified_at ? 'Yes' : 'No'}
                        </td>
                        <td className="px-4 py-2">
                          {user.last_logged_in
                            ? new Date(user.last_logged_in).toLocaleString()
                            : '-'}
                        </td>
                        <td className="px-4 py-2">
                          {avatar ? <Avatar img={avatar} size="md" rounded /> : '-'}
                        </td>
                        <td className="px-4 py-2">{sp ? sp.rating.toFixed(1) : '-'}</td>
                        <td className="px-4 py-2">{sp?.business_name || '-'}</td>
                        <td className="px-4 py-2">{sp?.service_category || '-'}</td>
                        <td className="px-4 py-2">{sp?.category || '-'}</td>
                        <td className="px-4 py-2">{sp?.workspaces || '-'}</td>
                        <td className="px-4 py-2">{sp?.start_date || '-'}</td>
                        <td className="px-4 py-2">{sp?.end_date || '-'}</td>
                        <td className="px-4 py-2 flex gap-2">
                          <Button
                            size="xs"
                            color="info"
                            onClick={() => alert(`View user ${user.id}`)}
                          >
                            View
                          </Button>
                          <Button
                            as={Link}
                            to={`/users/${user.id}/edit`}
                            size="xs"
                            color="warning"
                          >
                            Edit
                          </Button>
                          {user.role_id !== 1 && (
                            <Button
                              size="xs"
                              color="failure"
                              onClick={() => handleDelete(user)}
                            >
                              Delete
                            </Button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex justify-between items-center mt-4">
            <span className="text-sm text-gray-600">
              Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, total)} of{' '}
              {total} users
            </span>
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
              showIcons
            />
          </div>
        </>
      )}

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onClose={handleCancelDelete} popup size="md">
        <Modal.Header />
        <Modal.Body>
          <div className="text-center">
            <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
              Are you sure you want to delete user{' '}
              <span className="font-bold">{userToDelete?.email || userToDelete?.id}</span>?
            </h3>
            <div className="flex justify-center gap-4">
              <Button color="failure" onClick={handleConfirmDelete}>
                Yes, delete
              </Button>
              <Button color="gray" onClick={handleCancelDelete}>
                Cancel
              </Button>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </Card>
  );
}

export default UsersIndex;
