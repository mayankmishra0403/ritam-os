import { Routes, Route } from 'react-router-dom';
import PosLayout from './components/pos/PosLayout';
import TableView from './pages/TableView';
import BillingPage from './pages/BillingPage';
import OrdersPage from './pages/OrdersPage';
import MenuPage from './pages/MenuPage';
import ReportsPage from './pages/ReportsPage';
import SettingsPage from './pages/SettingsPage';
import KdsPage from './pages/KdsPage';

export default function App() {
  return (
    <Routes>
      {/* KDS is full-screen (outside PosLayout) */}
      <Route path="/kds" element={<KdsPage />} />

      {/* POS routes nested inside sidebar layout */}
      <Route path="/" element={<PosLayout />}>
        <Route index element={<TableView />} />
        <Route path="billing/:tableId?" element={<BillingPage />} />
        <Route path="orders" element={<OrdersPage />} />
        <Route path="menu" element={<MenuPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
    </Routes>
  );
}
