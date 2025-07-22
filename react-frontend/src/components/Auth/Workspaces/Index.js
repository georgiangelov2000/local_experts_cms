import { useEffect, useState, useCallback } from "react";
import { fetchCitiesPaginatied, updateCity } from "../../../api/cities";
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

function WorkspacesPage({ token }) {
  const [cities, setCities] = useState([]);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    search: "",
    sort: "service_providers_count",
    direction: "desc",
  });
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState(""); // For debounce

  // Edit Modal state
  const [showModal, setShowModal] = useState(false);
  const [editCity, setEditCity] = useState(null);
  const [editName, setEditName] = useState("");
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

  /** ✅ Fetch data from API */
  const fetchData = useCallback(() => {
    setLoading(true);
    const queryFilters = {
      search: filters.search,
      sort: filters.sort,
      direction: filters.direction,
    };

    fetchCitiesPaginatied(token, page, pageSize, queryFilters)
      .then((response) => {
        setCities(response.data || []);
        setTotal(response.total || 0);
        setTotalPages(response.last_page || 1);
        setLoading(false);
      })
      .catch(() => {
        console.error("Failed to load cities");
        setLoading(false);
      });
  }, [token, page, pageSize, filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  /** ✅ Toggle sort on header click */
  const handleSort = (field) => {
    setFilters((prev) => {
      const newDirection =
        prev.sort === field && prev.direction === "asc" ? "desc" : "asc";
      return { ...prev, sort: field, direction: newDirection };
    });
    setPage(1);
  };

  /** ✅ Render sort icon */
  const renderSortIcon = (field) => {
    if (filters.sort !== field) return "↕";
    return filters.direction === "asc" ? "↑" : "↓";
  };

  /** ✅ Open edit modal */
  const openEditModal = (city) => {
    setEditCity(city);
    setEditName(city.name);
    setShowModal(true);
    setError("");
    setSuccess("");
  };

  /** ✅ Save city changes */
  const handleSaveCity = async () => {
    if (!editName.trim()) {
      setError("City name cannot be empty.");
      return;
    }
    setError("");
    setSuccess("");
    try {
      const response = await updateCity(token, editCity.id, { name: editName });
      if (response.success || response.id) {
        setSuccess("City updated successfully.");
        setShowModal(false);
        fetchData();
      } else {
        setError(response.message || "Failed to update city.");
      }
    } catch (err) {
      setError("Error updating city.");
    }
  };

  return (
    <Card>
      {/* ✅ Header with search and per-page */}
      <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
        <h2 className="text-2xl font-bold flex-1">Cities</h2>

        {/* Debounced Search */}
        <TextInput
          className="md:w-64"
          placeholder="Search by city name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        {/* Per Page Dropdown */}
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
      </div>

      {/* ✅ Table */}
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
                  City Name {renderSortIcon("name")}
                </th>
                <th
                  className="px-4 py-3 cursor-pointer"
                  onClick={() => handleSort("service_providers_count")}
                >
                  Service Providers {renderSortIcon("service_providers_count")}
                </th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {cities.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-6 text-gray-400">
                    No cities found.
                  </td>
                </tr>
              ) : (
                cities.map((city) => (
                  <tr
                    key={city.id}
                    className="bg-white border-b hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700"
                  >
                    <td className="px-4 py-2">{city.id}</td>
                    <td className="px-4 py-2">{city.name}</td>
                    <td className="px-4 py-2">{city.service_providers_count}</td>
                    <td className="px-4 py-2 flex gap-2">
                      <Button size="xs" color="warning" onClick={() => openEditModal(city)}>
                        Edit
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ✅ Pagination */}
      <div className="flex justify-between items-center mt-4">
        <span className="text-sm text-gray-600">
          Showing {(page - 1) * pageSize + 1} to{" "}
          {Math.min(page * pageSize, total)} of {total} cities
        </span>
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
          showIcons
        />
      </div>

      {/* ✅ Edit Modal */}
      <Modal show={showModal} onClose={() => setShowModal(false)}>
        <Modal.Header>Edit City</Modal.Header>
        <Modal.Body>
          {error && <Alert className="mb-3" color="failure">{error}</Alert>}
          {success && <Alert className="mb-3" color="success">{success}</Alert>}
          <div className="flex flex-col gap-4">
            <TextInput
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              placeholder="City name"
            />
            <Button onClick={handleSaveCity}>Save</Button>
          </div>
        </Modal.Body>
      </Modal>
    </Card>
  );
}

export default WorkspacesPage;
