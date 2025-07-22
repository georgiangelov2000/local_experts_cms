import React, { useEffect, useState } from 'react';
import { Card, Spinner, Button } from 'flowbite-react';
import { useAuth } from './AuthContext';
import { Link } from 'react-router-dom';
import config from '../config';

function ProfilePage() {
  const { token, user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${config.API_BASE}/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => {
        setProfile(data);
        setLoading(false);
      });
  }, [token]);

  if (loading) {
    return <div className="flex justify-center items-center h-64"><Spinner /></div>;
  }

  if (!profile) {
    return <div className="text-center text-gray-500">Profile not found.</div>;
  }

  return (
    <Card className="max-w-xl mx-auto mt-8">
      <h2 className="text-2xl font-bold mb-4">My Profile</h2>
      <div className="mb-2"><span className="font-medium">Email:</span> {profile.email}</div>
      <div className="mb-2"><span className="font-medium">Role:</span> {profile.role_id === 1 ? 'Admin' : profile.role_id === 2 ? 'Service Provider' : 'User'}</div>
      {profile.role_id === 2 && profile.service_provider && (
        <>
          <div className="mb-2"><span className="font-medium">Business Name:</span> {profile.service_provider.business_name}</div>
          <div className="mb-2"><span className="font-medium">Service Category:</span> {profile.service_provider.service_category}</div>
          <div className="mb-2"><span className="font-medium">Category:</span> {profile.service_provider.category}</div>
          <div className="mb-2"><span className="font-medium">Start Date:</span> {profile.service_provider.start_date}</div>
          <div className="mb-2"><span className="font-medium">End Date:</span> {profile.service_provider.end_date}</div>
        </>
      )}
      <Button as={Link} to={`/users/${profile.id}/edit`} color="info" className="mt-4">Edit Profile</Button>
    </Card>
  );
}

export default ProfilePage; 