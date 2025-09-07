import React from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import DriverApplicationForm from '@/components/DriverApplicationForm';

const DriverApplication = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const handleSuccess = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-accent/5">
      <div className="container mx-auto py-8">
        <DriverApplicationForm onSuccess={handleSuccess} />
      </div>
    </div>
  );
};

export default DriverApplication;


