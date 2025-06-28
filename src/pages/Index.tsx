
import { useState, useEffect } from 'react';
import { LoginForm } from '@/components/LoginForm';
import { InventoryDashboard } from '@/components/InventoryDashboard';
import { useAuth } from '@/hooks/useAuth';

const Index = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-pulse">
          <div className="w-8 h-8 bg-blue-600 rounded-full"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginForm />;
  }

  return <InventoryDashboard />;
};

export default Index;
