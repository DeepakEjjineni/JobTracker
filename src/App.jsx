import React, { useState, useEffect, createContext, useContext } from "react";
import { BrowserRouter as Router, Routes, Route, Link, Navigate, Outlet, useNavigate, useLocation } from "react-router-dom";

/***** Simple CSS-in-JS styles (beginner-friendly) *****/
const styles = {
  container: { maxWidth: 900, margin: "20px auto", padding: 16, fontFamily: "Arial, sans-serif" },
  nav: { display: "flex", gap: 12, marginBottom: 16, alignItems: "center" },
  navLink: { textDecoration: "none", padding: "6px 10px", borderRadius: 6, border: "1px solid #ccc" },
  card: { border: "1px solid #e0e0e0", borderRadius: 8, padding: 12, marginBottom: 12, boxShadow: "0 1px 3px rgba(0,0,0,0.03)" },
  formRow: { marginBottom: 10 },
  label: { display: "block", marginBottom: 6, fontWeight: 600 },
  input: { width: "100%", padding: 8, borderRadius: 6, border: "1px solid #ccc" },
  error: { color: "#b00020", fontSize: 13, marginTop: 4 },
  btn: { padding: "8px 12px", borderRadius: 6, border: "none", cursor: "pointer" },
  btnPrimary: { background: "#1976d2", color: "white" },
  btnMuted: { background: "#f0f0f0", color: "#333" },
  table: { width: "100%", borderCollapse: "collapse" },
  th: { textAlign: "left", borderBottom: "1px solid #ddd", padding: 8 },
  td: { padding: 8, borderBottom: "1px solid #f3f3f3" },
  smallMuted: { color: "#666", fontSize: 13 }
};

/***** Auth Context (fake auth) *****/
const AuthContext = createContext();
function useAuth() { return useContext(AuthContext); }

function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem("jat_user");
      return raw ? JSON.parse(raw) : null;
    } catch (e) { return null; }
  });

  useEffect(() => {
    if (user) localStorage.setItem("jat_user", JSON.stringify(user));
    else localStorage.removeItem("jat_user");
  }, [user]);

  function login(email, password) {
    // Fake login: anyone can login if password length >=6
    const role = (email === "hrmanager@gmail.com") ? "manager" : "user";
    const u = { email, role };
    setUser(u);
    return u;
  }

  function logout() {
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

/***** Applications data storage via Context (simple global state) *****/
const AppsContext = createContext();
function useApps() { return useContext(AppsContext); }

function AppsProvider({ children }) {
  const [apps, setApps] = useState(() => {
    try {
      const raw = localStorage.getItem("jat_apps");
      return raw ? JSON.parse(raw) : [];
    } catch (e) { return []; }
  });

  useEffect(() => {
    localStorage.setItem("jat_apps", JSON.stringify(apps));
  }, [apps]);

  function addApp(app) {
    setApps(prev => [{ id: Date.now(), ...app }, ...prev]);
  }

  function updateApp(id, updated) {
    setApps(prev => prev.map(a => a.id === id ? { ...a, ...updated } : a));
  }

  function deleteApp(id) {
    setApps(prev => prev.filter(a => a.id !== id));
  }

  return (
    <AppsContext.Provider value={{ apps, addApp, updateApp, deleteApp }}>
      {children}
    </AppsContext.Provider>
  );
}

/***** PrivateRoute component (protect routes) *****/
function PrivateRoute({ children }) {
  const { user } = useAuth();
  const location = useLocation();
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  return children ? children : <Outlet />;
}

/***** Navbar *****/
function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  function handleLogout() { logout(); navigate("/"); }

  return (
    <nav style={styles.nav}>
      <Link to="/" style={styles.navLink}>Home</Link>
      {!user && <Link to="/login" style={styles.navLink}>Login</Link>}
      {user && <button onClick={handleLogout} style={{ ...styles.navLink, background: "transparent", border: "none" }}>Logout</button>}
      <Link to="/dashboard" style={styles.navLink}>Dashboard</Link>
      <Link to="/add-application" style={styles.navLink}>Add Application</Link>
      <Link to="/applications" style={styles.navLink}>Applications</Link>
      <div style={{ marginLeft: "auto", ...styles.smallMuted }}>{user ? user.email : "Not signed in"}</div>
    </nav>
  );
}

/***** Pages *****/
function Home() {
  return (
    <div>
      <div style={styles.card}>
        <h2>Welcome to Job Application Tracker</h2>
        <p>This is a small beginner-friendly React project for tracking job applications. Use the navbar to login and add/view applications.</p>
      </div>
      <div style={styles.card}>
        <h4>How to use</h4>
        <ul>
          <li>Login (fake) — any email and password (min 6 chars). hrmanager@gmail.com becomes manager.</li>
          <li>Add applications via the form.</li>
          <li>View, search, filter, sort and paginate applications.</li>
        </ul>
      </div>
    </div>
  );
}

function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/dashboard";

  useEffect(() => { if (user) navigate(from, { replace: true }); }, []);

  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});

  function validate() {
    const e = {};
    if (!form.email.includes("@") || form.email.length < 5) e.email = "Enter a valid email.";
    if (form.password.length < 6) e.password = "Password must be at least 6 characters.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit(ev) {
    ev.preventDefault();
    if (!validate()) return;
    login(form.email, form.password);
    navigate(from, { replace: true });
  }

  return (
    <div style={styles.card}>
      <h3>Login</h3>
      <form onSubmit={handleSubmit}>
        <div style={styles.formRow}>
          <label style={styles.label}>Email</label>
          <input style={styles.input} value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
          {errors.email && <div style={styles.error}>{errors.email}</div>}
        </div>
        <div style={styles.formRow}>
          <label style={styles.label}>Password</label>
          <input type="password" style={styles.input} value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
          {errors.password && <div style={styles.error}>{errors.password}</div>}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button type="submit" style={{ ...styles.btn, ...styles.btnPrimary }}>Login</button>
          <button type="button" onClick={() => { setForm({ email: "", password: "" }); setErrors({}); }} style={{ ...styles.btn, ...styles.btnMuted }}>Clear</button>
        </div>
      </form>
    </div>
  );
}

function AddApplication() {
  const { addApp } = useApps();
  const [form, setForm] = useState({ company: "", title: "", jobType: "Full-time", status: "Applied", location: "", appliedDate: "", notes: "" });
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState("");

  function validate() {
    const e = {};
    if (!form.company.trim()) e.company = "Company Name is required.";
    if (!form.title.trim()) e.title = "Job Title is required.";
    if (!form.jobType) e.jobType = "Job Type is required.";
    if (!form.status) e.status = "Status is required.";
    if (!form.location.trim()) e.location = "Location is required.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit(ev) {
    ev.preventDefault();
    if (!validate()) return;
    const payload = { ...form };
    addApp(payload);
    setForm({ company: "", title: "", jobType: "Full-time", status: "Applied", location: "", appliedDate: "", notes: "" });
    setErrors({});
    setSuccess("Application added!");
    setTimeout(() => setSuccess(""), 2200);
  }

  return (
    <div style={styles.card}>
      <h3>Add Job Application</h3>
      <form onSubmit={handleSubmit}>
        <div style={styles.formRow}>
          <label style={styles.label}>Company Name</label>
          <input style={styles.input} value={form.company} onChange={e => setForm({ ...form, company: e.target.value })} />
          {errors.company && <div style={styles.error}>{errors.company}</div>}
        </div>

        <div style={styles.formRow}>
          <label style={styles.label}>Job Title</label>
          <input style={styles.input} value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
          {errors.title && <div style={styles.error}>{errors.title}</div>}
        </div>

        <div style={styles.formRow}>
          <label style={styles.label}>Job Type</label>
          <select style={styles.input} value={form.jobType} onChange={e => setForm({ ...form, jobType: e.target.value })}>
            <option>Full-time</option>
            <option>Internship</option>
            <option>Part-time</option>
            <option>Contract</option>
          </select>
          {errors.jobType && <div style={styles.error}>{errors.jobType}</div>}
        </div>

        <div style={styles.formRow}>
          <label style={styles.label}>Status</label>
          <select style={styles.input} value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
            <option>Applied</option>
            <option>Interview Scheduled</option>
            <option>Rejected</option>
            <option>Selected</option>
          </select>
          {errors.status && <div style={styles.error}>{errors.status}</div>}
        </div>

        <div style={styles.formRow}>
          <label style={styles.label}>Location</label>
          <input style={styles.input} value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} />
          {errors.location && <div style={styles.error}>{errors.location}</div>}
        </div>

        <div style={styles.formRow}>
          <label style={styles.label}>Applied Date</label>
          <input type="date" style={styles.input} value={form.appliedDate} onChange={e => setForm({ ...form, appliedDate: e.target.value })} />
        </div>

        <div style={styles.formRow}>
          <label style={styles.label}>Notes (optional)</label>
          <textarea rows={3} style={styles.input} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })}></textarea>
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <button type="submit" style={{ ...styles.btn, ...styles.btnPrimary }}>Add Application</button>
          <button type="button" onClick={() => { setForm({ company: "", title: "", jobType: "Full-time", status: "Applied", location: "", appliedDate: "", notes: "" }); setErrors({}); }} style={{ ...styles.btn, ...styles.btnMuted }}>Reset</button>
        </div>
        {success && <div style={{ marginTop: 10, color: "green" }}>{success}</div>}
      </form>
    </div>
  );
}

function Applications() {
  const { apps, deleteApp } = useApps();
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [sortMode, setSortMode] = useState(null); // 'company' or 'date'
  const [page, setPage] = useState(1);
  const perPage = 5;

  useEffect(() => { setPage(1); }, [search, filterType, filterStatus, sortMode]);

  function applyAll(items) {
    let out = [...items];
    // search by company or title
    if (search.trim()) {
      const s = search.toLowerCase();
      out = out.filter(a => a.company.toLowerCase().includes(s) || a.title.toLowerCase().includes(s));
    }
    if (filterType !== "All") out = out.filter(a => a.jobType === filterType);
    if (filterStatus !== "All") out = out.filter(a => a.status === filterStatus);
    if (sortMode === "company") out.sort((x,y) => x.company.localeCompare(y.company));
    if (sortMode === "date") out.sort((x,y) => {
      const da = x.appliedDate || "1970-01-01";
      const db = y.appliedDate || "1970-01-01";
      return new Date(db) - new Date(da); // newest first
    });
    return out;
  }

  const filtered = applyAll(apps);
  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const pageItems = filtered.slice((page-1)*perPage, page*perPage);

  function handleDelete(id) {
    if (window.confirm("Delete this application?")) deleteApp(id);
  }

  return (
    <div>
      <div style={styles.card}>
        <h3>Applications</h3>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
          <input placeholder="Search by company or title" value={search} onChange={e => setSearch(e.target.value)} style={{ ...styles.input, minWidth: 220 }} />
          <select value={filterType} onChange={e => setFilterType(e.target.value)} style={{ ...styles.input, width: 160 }}>
            <option>All</option>
            <option>Full-time</option>
            <option>Internship</option>
            <option>Part-time</option>
            <option>Contract</option>
          </select>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ ...styles.input, width: 200 }}>
            <option>All</option>
            <option>Applied</option>
            <option>Interview Scheduled</option>
            <option>Rejected</option>
            <option>Selected</option>
          </select>
        </div>

        <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
          <button onClick={() => setSortMode("company")} style={{ ...styles.btn, ...styles.btnMuted }}>Sort by Company (A–Z)</button>
          <button onClick={() => setSortMode("date")} style={{ ...styles.btn, ...styles.btnMuted }}>Sort by Applied Date (Newest)</button>
          <button onClick={() => setSortMode(null)} style={{ ...styles.btn, ...styles.btnMuted }}>Reset Sorting</button>
        </div>

        <div style={{ marginBottom: 8 }} className="small-muted">Showing {filtered.length} result(s)</div>

        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Company</th>
              <th style={styles.th}>Job Title</th>
              <th style={styles.th}>Type</th>
              <th style={styles.th}>Status</th>
              <th style={styles.th}>Location</th>
              <th style={styles.th}>Applied Date</th>
              <th style={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {pageItems.map(a => (
              <tr key={a.id}>
                <td style={styles.td}>{a.company}</td>
                <td style={styles.td}>{a.title}</td>
                <td style={styles.td}>{a.jobType}</td>
                <td style={styles.td}>{a.status}</td>
                <td style={styles.td}>{a.location}</td>
                <td style={styles.td}>{a.appliedDate || "-"}</td>
                <td style={styles.td}>
                  {/* Bonus: simple delete */}
                  <button onClick={() => handleDelete(a.id)} style={{ ...styles.btn, ...styles.btnMuted }}>Delete</button>
                </td>
              </tr>
            ))}
            {pageItems.length === 0 && (
              <tr><td style={styles.td} colSpan={7}>No applications found.</td></tr>
            )}
          </tbody>
        </table>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12 }}>
          <div>Page {page} of {totalPages}</div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page===1} style={{ ...styles.btn, ...styles.btnMuted }}>Previous</button>
            <button onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={page===totalPages} style={{ ...styles.btn, ...styles.btnMuted }}>Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Dashboard() {
  const { apps } = useApps();
  const total = apps.length;
  const applied = apps.filter(a => a.status === "Applied").length;
  const interview = apps.filter(a => a.status === "Interview Scheduled").length;
  const selected = apps.filter(a => a.status === "Selected").length;
  const rejected = apps.filter(a => a.status === "Rejected").length;
  const lastFive = apps.slice(0,5);

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 10, marginBottom: 12 }}>
        <div style={styles.card}><h4>Total</h4><div style={{ fontSize: 20 }}>{total}</div></div>
        <div style={styles.card}><h4>Applied</h4><div style={{ fontSize: 20 }}>{applied}</div></div>
        <div style={styles.card}><h4>Interview</h4><div style={{ fontSize: 20 }}>{interview}</div></div>
        <div style={styles.card}><h4>Selected</h4><div style={{ fontSize: 20 }}>{selected}</div></div>
        <div style={styles.card}><h4>Rejected</h4><div style={{ fontSize: 20 }}>{rejected}</div></div>
      </div>

      <div style={styles.card}>
        <h4>Last 5 applications</h4>
        {lastFive.length === 0 && <div>No applications yet.</div>}
        <ul>
          {lastFive.map(a => <li key={a.id}>{a.company} — {a.title} ({a.status})</li>)}
        </ul>
      </div>
    </div>
  );
}

function NotFound() {
  return (
    <div style={styles.card}><h3>404 - Page Not Found</h3><p>The page you are looking for does not exist.</p></div>
  );
}

/***** App root with routing *****/
export default function App() {
  return (
    <AuthProvider>
      <AppsProvider>
        <Router>
          <div style={styles.container}>
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
          </div>
        </Router>
      </AppsProvider>
    </AuthProvider>
  );
}

