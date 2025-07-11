import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './login/Login';
import Dashboard from './admin/Dashboard';
import User from './admin/User';
import PrivateRoute from './route/PrivateRoute';
import CreateCustomer from './admin/CreateCustomer';
import EditTechnician from './admin/EditTechnician';
import Setting from './admin/Setting';
import EditCustomer from './admin/EditCustomer';
import Jobs from './admin/Jobs';
import Report from './admin/Report';
import ReportCustomer from './admin/ReportCustomer';
import ReportTechnician from './admin/ReportTechnician';

function App() {
  const token = localStorage.getItem('token');
  return (
    <BrowserRouter>
      <Routes>
        {/* Public route */}
        <Route path="/" element={ token ? <Navigate to="/dashboard" /> : <Navigate to="/Login" />} />
        <Route path="/login" element={<Login />} />

        {/* Protected routes */}
        <Route element={<PrivateRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/user" element={<User />} />
          <Route path="/setting" element={<Setting />} />
          <Route path="/job" element={<Jobs />} />
          <Route path="/report" element={<Report />} />
          <Route path="/createCustomer" element={<CreateCustomer />} />
          <Route path="/editTechnician/:userId" element={<EditTechnician />} />
          <Route path="/editCustomer/:id" element={<EditCustomer />} />
          <Route path="/reportCustomer/:id" element={<ReportCustomer />} />
          <Route path="/reportTechnician/:userId" element={<ReportTechnician />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
