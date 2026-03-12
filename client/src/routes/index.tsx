import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import Dashboard from '../pages/Dashboard';
import ItemsPage from '../pages/items/ItemsPage';
import ItemDetailPage from '../pages/items/ItemDetailPage';

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="items" element={<ItemsPage />} />
        <Route path="items/new" element={<ItemDetailPage />} />
        <Route path="items/:id" element={<ItemDetailPage />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
