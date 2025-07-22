import { Select, TextInput } from "flowbite-react";

export function Filters({ categories = [], serviceCategories = [], workstations = [], filters, onChange }) {
    return (
        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4 flex-wrap">
            <h2 className="text-2xl font-bold flex-1">Users</h2>

            {/* Roles */}
            <Select
                className="md:w-48"
                value={filters.role || ""}
                onChange={(e) => onChange({ ...filters, role: e.target.value })}
            >
                <option value="">All Roles</option>
                <option value="1">Admin</option>
                <option value="2">Service Provider</option>
                <option value="3">User</option>
            </Select>

            {/* Categories */}
            <Select
                className="md:w-48"
                value={filters.category || ""}
                onChange={(e) => onChange({ ...filters, category: e.target.value })}
            >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
            </Select>

            {/* Service Categories */}
            <Select
                className="md:w-48"
                value={filters.serviceCategory || ""}
                onChange={(e) => onChange({ ...filters, serviceCategory: e.target.value })}
            >
                <option value="">All Service Categories</option>
                {serviceCategories.map((sc) => (
                    <option key={sc.id} value={sc.id}>{sc.name}</option>
                ))}
            </Select>

            {/* Workspaces */}
            <Select
                className="md:w-48"
                value={filters.workspace || ""}
                onChange={(e) => onChange({ ...filters, workspace: e.target.value })}
            >
                <option value="">All Workspaces</option>
                {workstations.map((ws) => (
                    <option key={ws.id} value={ws.id}>{ws.name}</option>
                ))}
            </Select>

            {/* Ratings */}
            <Select
                className="md:w-32"
                value={filters.rating || ""}
                onChange={(e) => onChange({ ...filters, rating: e.target.value })}
            >
                <option value="">All Ratings</option>
                <option value="1">1+</option>
                <option value="2">2+</option>
                <option value="3">3+</option>
                <option value="4">4+</option>
                <option value="5">5</option>
            </Select>

            {/* Search */}
            <TextInput
                className="md:w-64"
                placeholder="Search by email or business name..."
                value={filters.search || ""}
                onChange={(e) => onChange({ ...filters, search: e.target.value })}
            />
        </div>
    );
}
