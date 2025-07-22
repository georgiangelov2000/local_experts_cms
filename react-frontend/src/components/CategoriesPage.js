import { useEffect, useState, useCallback } from "react";
import {
  fetchCategoriesPaginated,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../api/categories";
import {
  Card,
  Spinner,
  TextInput,
  Pagination,
  Select,
  Button,
  Modal,
  Alert,
} from "flowbite-react";

function CategoriesPage({ token }) {
  const [categories, setCategories] = useState([]);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    search: "",
    sort: "id",
    direction: "asc",
  });
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState(""); // For debounce

  // Modal state for Add/Edit
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("add"); // add | edit
  const [form, setForm] = useState({ name: "" });
  const [selectedId, setSelectedId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  /** ✅ Debounce search */
  useEffect(() => {
    const delay = setTimeout(() => {
      setFilters((prev) => ({ ...prev, search: searchTerm }));
      setPage(1);
    }, 500);
    return () => clearTimeout(delay);
  }, [searchTerm]);

  /** ✅ Fetch data */
  const fetchData = useCallback(() => {
    setLoading(true);
    fetchCategoriesPaginated(token, page, pageSize, filters)
      .then((response) => {
        setCategories(response.data || []);
        setTotal(response.meta?.total || 0);
        setTotalPages(response.meta?.last_page || 1);
        setLoading(false);
      })
      .catch(() => {
        console.error("Failed to load categories");
        setLoading(false);
      });
  }, [token, page, pageSize, filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  /** ✅ Sort handler */
  const handleSort = (field) => {
    setFilters((prev) => {
      const newDirection =
        prev.sort === field && prev.direction === "asc" ? "desc" : "asc";
      return { ...prev, sort: field, direction: newDirection };
    });
    setPage(1);
  };

  /** ✅ Sort icon */
  const renderSortIcon = (field) => {
    if (filters.sort !== field) return "↕";
    return filters.direction === "asc" ? "↑" : "↓";
  };

  /** ✅ Modal Handlers */
  const openAddModal = () => {
    setForm({ name: "" });
    setModalMode("add");
    setShowModal(true);
    setError("");
    setSuccess("");
  };

  const openEditModal = (category) => {
    setForm({ name: category.name });
    setSelectedId(category.id);
    setModalMode("edit");
    setShowModal(true);
    setError("");
    setSuccess("");
  };

  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  /** ✅ Save Category */
  const handleSave = async () => {
    setError("");
    setSuccess("");
    try {
      const method = modalMode === "add" ? createCategory : updateCategory;
      const id = modalMode === "edit" ? selectedId : null;
      const res = await method(token, id, form);
      if (res.data || res.message) {
        setSuccess("Category saved successfully");
        setShowModal(false);
        fetchData();
      } else {
        setError(res.message || "Failed to save category");
      }
    } catch {
      setError("Network error");
    }
  };

  /** ✅ Delete Category */
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this category?")) return;
    try {
      const res = await deleteCategory(token, id);
      if (res.success || res.message === "Category deleted successfully") {
        fetchData();
      } else {
        alert("Failed to delete category");
      }
    } catch {
      alert("Error deleting category");
    }
  };

  return (
    <Card>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
        <h2 className="text-2xl font-bold flex-1">Categories</h2>
        <TextInput
          className="md:w-64"
          placeholder="Search by name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Select
          className="md:w-24"
          value={pageSize}
          onChange={(e) => {
            setPageSize(parseInt(e.target.value));
            setPage(1);
          }}
        >
          <option value="5">5</option>
          <option value="10">10</option>
          <option value="25">25</option>
          <option value="50">50</option>
        </Select>
        <Button color="success" onClick={openAddModal}>
          Add Category
        </Button>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center items-center h-32">
          <Spinner />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400 border rounded-lg">
            <thead className="text-xs uppercase bg-gray-100 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <th
                  className="px-4 py-3 cursor-pointer"
                  onClick={() => handleSort("id")}
                >
                  ID {renderSortIcon("id")}
                </th>
                <th
                  className="px-4 py-3 cursor-pointer"
                  onClick={() => handleSort("name")}
                >
                  Name {renderSortIcon("name")}
                </th>
                <th className="px-4 py-3">Alias</th>
                <th
                  className="px-4 py-3 cursor-pointer"
                  onClick={() => handleSort("service_providers_count")}
                >
                  Providers {renderSortIcon("service_providers_count")}
                </th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-6 text-gray-400">
                    No categories found.
                  </td>
                </tr>
              ) : (
                categories.map((cat) => (
                  <tr
                    key={cat.id}
                    className="bg-white border-b hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700"
                  >
                    <td className="px-4 py-2">{cat.id}</td>
                    <td className="px-4 py-2">{cat.name}</td>
                    <td className="px-4 py-2">{cat.alias}</td>
                    <td className="px-4 py-2">
                      {cat.service_providers_count || 0}
                    </td>
                    <td className="px-4 py-2 flex gap-2">
                      <Button
                        size="xs"
                        color="warning"
                        onClick={() => openEditModal(cat)}
                      >
                        Edit
                      </Button>
                      <Button
                        size="xs"
                        color="failure"
                        onClick={() => handleDelete(cat.id)}
                      >
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      <div className="flex justify-between items-center mt-4">
        <span className="text-sm text-gray-600">
          Showing {(page - 1) * pageSize + 1} to{" "}
          {Math.min(page * pageSize, total)} of {total} categories
        </span>
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
          showIcons
        />
      </div>

      {/* Modal for Add/Edit */}
      <Modal show={showModal} onClose={() => setShowModal(false)}>
        <Modal.Header>
          {modalMode === "add" ? "Add Category" : "Edit Category"}
        </Modal.Header>
        <Modal.Body>
          {error && <Alert color="failure">{error}</Alert>}
          {success && <Alert color="success">{success}</Alert>}
          <div className="flex flex-col gap-4">
            <TextInput
              name="name"
              value={form.name}
              onChange={handleFormChange}
              placeholder="Category name"
              required
            />
            <Button onClick={handleSave}>Save</Button>
          </div>
        </Modal.Body>
      </Modal>
    </Card>
  );
}

export default CategoriesPage;
