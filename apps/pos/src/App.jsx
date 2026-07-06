import { Routes, Route } from 'react-router-dom';
import PosLayout from './components/pos/PosLayout';
import TableView from './pages/TableView';
import BillingPage from './pages/BillingPage';
import OrdersPage from './pages/OrdersPage';
import MenuPage from './pages/MenuPage';
import ReportsPage from './pages/ReportsPage';
import SettingsPage from './pages/SettingsPage';

export default function App() {
  return (
    <Routes>
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
