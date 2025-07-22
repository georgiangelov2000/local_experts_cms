import React, { useEffect, useState } from 'react';
import { Button, Card, TextInput, Pagination } from 'flowbite-react';

const API_BASE = 'http://localhost:80/api/cms/v1';

function CategoriesPage({ token }) {
  const [categories, setCategories] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const pageSize = 10;

  useEffect(() => {
    fetch(`${API_BASE}/categories?start=${(page - 1) * pageSize}&length=${pageSize}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => {
        setCategories(data.data || []);
        setTotal(data.recordsTotal || (data.data ? data.data.length : 0));
      });
  }, [token, page]);

  const totalPages = Math.ceil(total / pageSize);

  // Placeholder action handlers
  const handleView = (cat) => alert(`View category ${cat.id}`);
  const handleEdit = (cat) => alert(`Edit category ${cat.id}`);
  const handleDelete = (cat) => {
    if (window.confirm(`Delete category ${cat.id}?`)) {
      alert('Delete logic here');
    }
  };

  // Client-side filtering for current page
  const filteredCategories = categories.filter(cat =>
    search === '' ||
    cat.name.toLowerCase().includes(search.toLowerCase()) ||
    (cat.description && cat.description.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <Card>
      <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
        <h2 className="text-2xl font-bold flex-1">Categories</h2>
        <TextInput
          className="md:w-64"
          placeholder="Search by name or description..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <Button color="success" onClick={() => alert('Add Category (implement modal)')}>Add Category</Button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400 border rounded-lg">
          <thead className="text-xs uppercase bg-gray-100 dark:bg-gray-700 dark:text-gray-400">
            <tr>
              <th className="px-4 py-3">ID</th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Description</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCategories.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center py-6 text-gray-400">No categories found.</td>
              </tr>
            ) : (
              filteredCategories.map(cat => (
                <tr key={cat.id} className="bg-white border-b hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700">
                  <td className="px-4 py-2">{cat.id}</td>
                  <td className="px-4 py-2">{cat.name}</td>
                  <td className="px-4 py-2">{cat.description}</td>
                  <td className="px-4 py-2 flex gap-2">
                    <Button size="xs" color="info" onClick={() => handleView(cat)}>View</Button>
                    <Button size="xs" color="warning" onClick={() => handleEdit(cat)}>Edit</Button>
                    <Button size="xs" color="failure" onClick={() => handleDelete(cat)}>Delete</Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {/* Pagination Controls */}
      <div className="flex justify-between items-center mt-4">
        <span className="text-sm text-gray-600">
          Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, total)} of {total} categories
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

export default CategoriesPage; 