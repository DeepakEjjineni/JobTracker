import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';


export default function Navbar() {
const { user, logout } = useAuth();


return (
<nav style={{ padding: 10, borderBottom: '1px solid #ccc' }}>
<Link to="/">Home</Link> |
<Link to="/dashboard">Dashboard</Link> |
<Link to="/add-application">Add</Link> |
<Link to="/applications">Applications</Link> |
{user ? <button onClick={logout}>Logout</button> : <Link to="/login">Login</Link>}
</nav>
);
}