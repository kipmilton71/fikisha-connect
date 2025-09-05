import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import Layout from '@/components/Layout';
import CustomerDashboard from '@/components/CustomerDashboard';
import DriverDashboard from '@/components/DriverDashboard';

const Index = () => {
  const { profile } = useAuth();

  if (!profile) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {profile.role === 'driver' ? <DriverDashboard /> : <CustomerDashboard />}
    </Layout>
  );
};

export default Index;
