import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import CategoriesPage from './components/CategoriesPage';
import Login from './components/Login';
import { AuthProvider, useAuth } from './components/AuthContext';
import { Navbar, Dropdown, Avatar } from 'flowbite-react';
import { HiMenu } from 'react-icons/hi';
import UsersIndex from './components/Auth/Users/Index';
import UserEdit from './components/Auth/Users/Edit';
import UserAdd from './components/Auth/Users/Add';
import './App.css';
import Dashboard from './components/Dashboard';
import WorkspacesPage from './components/WorkspacesPage';
import ProfilePage from './components/ProfilePage';

// Placeholder for user view page
function UserView({ token }) {
  // You can implement fetching and display logic here
  return <div className="p-8"><h2 className="text-2xl font-bold mb-4">User Details</h2><div>TODO: Implement user view page</div></div>;
}

function AppRoutes() {
  const { token, logout, loading, login, user } = useAuth();

  if (!token) {
    return <Login onLogin={login} loading={loading} />;
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navbar fluid rounded className="bg-white shadow px-4">
          <Navbar.Brand as={Link} to="/">
            <img src="/favicon.ico" className="mr-3 h-6 sm:h-9" alt="CMS Logo" />
            <span className="self-center whitespace-nowrap text-xl font-semibold dark:text-white">CMS Dashboard</span>
          </Navbar.Brand>
          <div className="flex md:order-2 gap-2 items-center">
            <Dropdown
              arrowIcon={false}
              inline
              label={
                <Avatar
                  alt="User avatar"
                  img={user?.avatar || undefined}
                  rounded
                />
              }
            >
              <Dropdown.Header>
                <span className="block text-sm">{user?.email || 'User'}</span>
                <span className="block truncate text-xs font-medium">{user?.role_id === 1 ? 'Admin' : user?.role_id === 2 ? 'Service Provider' : 'User'}</span>
              </Dropdown.Header>
              <Dropdown.Item as={Link} to="/profile">Profile</Dropdown.Item>
              <Dropdown.Divider />
              <Dropdown.Item as={Link} to="/users">Profile</Dropdown.Item>
              <Dropdown.Divider />
              <Dropdown.Item onClick={logout}>Sign out</Dropdown.Item>
            </Dropdown>
          </div>
          <Navbar.Toggle />
          <Navbar.Collapse>
            <Navbar.Link as={Link} to="/" active={window.location.pathname === '/'}>Dashboard</Navbar.Link>
            <Navbar.Link as={Link} to="/categories" active={window.location.pathname === '/categories'}>Categories</Navbar.Link>
            <Navbar.Link as={Link} to="/users" active={window.location.pathname === '/users'}>Users</Navbar.Link>
            <Navbar.Link as={Link} to="/workspaces" active={window.location.pathname === '/workspaces'}>Workspaces</Navbar.Link>
          </Navbar.Collapse>
        </Navbar>
        <main className="p-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/categories" element={<CategoriesPage token={token} />} />
            <Route path="/users" element={<UsersIndex token={token} />} />
            <Route path="/users/add" element={<UserAdd token={token} />} />
            <Route path="/users/:id" element={<UserView token={token} />} />
            <Route path="/users/:id/edit" element={<UserEdit token={token} />} />
            <Route path="/workspaces" element={<WorkspacesPage token={token} />} />
            <Route path="/profile" element={<ProfilePage />} />
            {/* Add Workspaces route here when ready */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;
