import React, { useEffect, useState } from 'react';
import { Card, Button, Spinner } from 'flowbite-react';
import { HiUserGroup, HiCollection, HiViewGrid } from 'react-icons/hi';
import { Link } from 'react-router-dom';

const API_BASE = 'http://localhost:81/api/v1';

function Dashboard({ token }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      setLoading(true);
      try {
        const [usersRes, categoriesRes, workspacesRes] = await Promise.all([
          fetch(`${API_BASE}/users?start=0&length=1`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_BASE}/categories`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_BASE}/workspaces`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        const usersData = await usersRes.json();
        const categoriesData = await categoriesRes.json();
        const workspacesData = await workspacesRes.json();
        // Count service providers from users
        const serviceProviders = usersData.data ? usersData.data.filter(u => u.role_id === 2).length : 0;
        setStats({
          users: usersData.recordsTotal || (usersData.data ? usersData.data.length : 0),
          serviceProviders,
          categories: categoriesData.data ? categoriesData.data.length : 0,
          workspaces: workspacesData.data ? workspacesData.data.length : 0,
        });
      } catch (e) {
        setStats({ users: 0, serviceProviders: 0, categories: 0, workspaces: 0 });
      }
      setLoading(false);
    }
    if (token) fetchStats();
  }, [token]);

  return (
    <div className="max-w-7xl mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Welcome to your CMS Dashboard</h1>
      {loading ? (
        <div className="flex justify-center items-center h-32"><Spinner /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="flex flex-col items-center text-center">
            <HiUserGroup className="w-8 h-8 text-blue-600 mb-2" />
            <div className="text-2xl font-bold">{stats.users}</div>
            <div className="text-gray-500">Users</div>
            <Button as={Link} to="/users" size="xs" color="info" className="mt-2">View</Button>
          </Card>
          <Card className="flex flex-col items-center text-center">
            <HiUserGroup className="w-8 h-8 text-green-600 mb-2" />
            <div className="text-2xl font-bold">{stats.serviceProviders}</div>
            <div className="text-gray-500">Service Providers</div>
            <Button as={Link} to="/users?role=2" size="xs" color="info" className="mt-2">View</Button>
          </Card>
          <Card className="flex flex-col items-center text-center">
            <HiCollection className="w-8 h-8 text-purple-600 mb-2" />
            <div className="text-2xl font-bold">{stats.categories}</div>
            <div className="text-gray-500">Categories</div>
            <Button as={Link} to="/categories" size="xs" color="info" className="mt-2">View</Button>
          </Card>
          <Card className="flex flex-col items-center text-center">
            <HiViewGrid className="w-8 h-8 text-yellow-600 mb-2" />
            <div className="text-2xl font-bold">{stats.workspaces}</div>
            <div className="text-gray-500">Workspaces</div>
            <Button as={Link} to="/workspaces" size="xs" color="info" className="mt-2">View</Button>
          </Card>
        </div>
      )}
      <Card>
        <h2 className="text-xl font-semibold mb-2">Quick Actions</h2>
        <div className="flex flex-wrap gap-4">
          <Button as={Link} to="/users" color="info">Manage Users</Button>
          <Button as={Link} to="/categories" color="info">Manage Categories</Button>
          <Button as={Link} to="/workspaces" color="info">Manage Workspaces</Button>
        </div>
      </Card>
    </div>
  );
}

export default Dashboard; 