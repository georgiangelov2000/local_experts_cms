import React from 'react';
import { Navbar, Dropdown, Avatar } from 'flowbite-react';
import { Link } from 'react-router-dom';
import { useAuth } from './AuthContext';

function Layout({ children }) {
  const { user, logout } = useAuth();

  return (
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
            <Dropdown.Item as={Link} to="/users">Users</Dropdown.Item>
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
      <main className="p-8">{children}</main>
    </div>
  );
}

export default Layout; 