import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './login/Login';
import Dashboard from './admin/Dashboard';
import User from './admin/User';
import PrivateRoute from './route/PrivateRoute';
import CreateCustomer from './admin/CreateCustomer';
import EditTechnician from './admin/EditTechnician';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public route */}
        <Route path="/login" element={<Login />} />

        {/* Protected routes */}
        <Route element={<PrivateRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/user" element={<User />} />
          <Route path="/createCustomer" element={<CreateCustomer />} />
          <Route path="/editTechnician/:userId" element={<EditTechnician />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
