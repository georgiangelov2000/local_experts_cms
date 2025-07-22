import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './components/AuthContext';
import Layout from './components/Layout';
import CategoriesPage from './components/CategoriesPage';
import UsersIndex from './components/Auth/Users/Index';
import UserEdit from './components/Auth/Users/Edit';
import UserAdd from './components/Auth/Users/Add';
import Dashboard from './components/Dashboard';
import WorkspacesIndex from './components/Auth/Workspaces/Index';
import ProfilePage from './components/ProfilePage';
import Login from './components/Login';

function UserView({ token }) {
  return <div className="p-8"><h2 className="text-2xl font-bold mb-4">User Details</h2><div>TODO: Implement user view page</div></div>;
}

function AppRoutes() {
  const { token, login, loading } = useAuth();

  if (!token) {
    return <Login onLogin={login} loading={loading} />;
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/categories" element={<CategoriesPage token={token} />} />
        <Route path="/users" element={<UsersIndex token={token} />} />
        <Route path="/users/add" element={<UserAdd token={token} />} />
        <Route path="/users/:id" element={<UserView token={token} />} />
        <Route path="/users/:id/edit" element={<UserEdit token={token} />} />
        <Route path="/workspaces" element={<WorkspacesIndex token={token} />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Layout>
  );
}

export default AppRoutes; 