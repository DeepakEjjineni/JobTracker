import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AppsProvider } from './context/AppsContext';
import Navbar from './components/Navbar';
import PrivateRoute from './components/PrivateRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AddApplication from './pages/AddApplication';
import Applications from './pages/Applications';
import NotFound from './pages/NotFound';


export default function App() {
return (
<BrowserRouter>
<AuthProvider>
<AppsProvider>
<Navbar />
<Routes>
<Route path="/" element={<Home />} />
<Route path="/login" element={<Login />} />


<Route element={<PrivateRoute />}>
<Route path="/dashboard" element={<Dashboard />} />
<Route path="/add-application" element={<AddApplication />} />
<Route path="/applications" element={<Applications />} />
</Route>


<Route path="*" element={<NotFound />} />
</Routes>
</AppsProvider>
</AuthProvider>
</BrowserRouter>
);
}