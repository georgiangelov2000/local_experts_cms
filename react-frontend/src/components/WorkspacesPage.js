import React, { useEffect, useState } from 'react';
import { Card, Button, TextInput, Spinner, Modal, Select, Alert } from 'flowbite-react';
import { Link } from 'react-router-dom';

const API_BASE = 'http://localhost:80/api/cms/v1';

function WorkspacesPage({ token }) {
  const [workspaces, setWorkspaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
  const [form, setForm] = useState({ name: '', city_id: '' });
  const [cities, setCities] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetch(`${API_BASE}/workspaces`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => {
        setWorkspaces(data.data || []);
        setLoading(false);
      });
    fetch(`${API_BASE}/cities`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => setCities(data.data || []));
  }, [token]);

  const reloadWorkspaces = () => {
    setLoading(true);
    fetch(`${API_BASE}/workspaces`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => {
        setWorkspaces(data.data || []);
        setLoading(false);
      });
  };

  const openAddModal = () => {
    setForm({ name: '', city_id: '' });
    setSelectedId(null);
    setModalMode('add');
    setShowModal(true);
    setError('');
    setSuccess('');
  };

  const openEditModal = (ws) => {
    setForm({ name: ws.name, city_id: ws.city_id });
    setSelectedId(ws.id);
    setModalMode('edit');
    setShowModal(true);
    setError('');
    setSuccess('');
  };

  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const method = modalMode === 'add' ? 'POST' : 'PUT';
      const url = modalMode === 'add'
        ? `${API_BASE}/workspaces`
        : `${API_BASE}/workspaces/${selectedId}`;
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess('Workspace saved!');
        setShowModal(false);
        reloadWorkspaces();
      } else {
        setError(data.message || 'Failed to save workspace');
      }
    } catch (e) {
      setError('Network error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this workspace?')) return;
    setError('');
    setSuccess('');
    try {
      const res = await fetch(`${API_BASE}/workspaces/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setSuccess('Workspace deleted!');
        reloadWorkspaces();
      } else {
        setError('Failed to delete workspace');
      }
    } catch (e) {
      setError('Network error');
    }
  };

  const filteredWorkspaces = workspaces.filter(ws =>
    search === '' ||
    ws.name.toLowerCase().includes(search.toLowerCase()) ||
    (ws.city && ws.city.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <Card>
      <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
        <h2 className="text-2xl font-bold flex-1">Workspaces</h2>
        <TextInput
          className="md:w-64"
          placeholder="Search by name or city..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <Button color="success" onClick={openAddModal}>Add Workspace</Button>
      </div>
      {error && <Alert color="failure" className="mb-2">{error}</Alert>}
      {success && <Alert color="success" className="mb-2">{success}</Alert>}
      {loading ? (
        <div className="flex justify-center items-center h-32"><Spinner /></div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400 border rounded-lg">
            <thead className="text-xs uppercase bg-gray-100 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">City</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredWorkspaces.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-6 text-gray-400">No workspaces found.</td>
                </tr>
              ) : (
                filteredWorkspaces.map(ws => (
                  <tr key={ws.id} className="bg-white border-b hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700">
                    <td className="px-4 py-2">{ws.id}</td>
                    <td className="px-4 py-2">{ws.name}</td>
                    <td className="px-4 py-2">{ws.city}</td>
                    <td className="px-4 py-2 flex gap-2">
                      <Button size="xs" color="info" onClick={() => alert(`View workspace ${ws.id}`)}>View</Button>
                      <Button size="xs" color="warning" onClick={() => openEditModal(ws)}>Edit</Button>
                      <Button size="xs" color="failure" onClick={() => handleDelete(ws.id)}>Delete</Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
      <Modal show={showModal} onClose={() => setShowModal(false)}>
        <Modal.Header>{modalMode === 'add' ? 'Add Workspace' : 'Edit Workspace'}</Modal.Header>
        <Modal.Body>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <TextInput name="name" value={form.name} onChange={handleFormChange} required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">City</label>
              <Select name="city_id" value={form.city_id} onChange={handleFormChange} required>
                <option value="">Select city</option>
                {cities.map(city => (
                  <option key={city.id} value={city.id}>{city.name}</option>
                ))}
              </Select>
            </div>
            <Button type="submit">Save</Button>
          </form>
        </Modal.Body>
      </Modal>
    </Card>
  );
}

export default WorkspacesPage; 