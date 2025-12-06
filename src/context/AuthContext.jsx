import { createContext, useContext, useState } from 'react';


const AuthContext = createContext();


export function AuthProvider({ children }) {
const [user, setUser] = useState(null);


const login = (email, password) => {
const role = email === 'hrmanager@gmail.com' ? 'manager' : 'user';
setUser({ email, role });
};


const logout = () => setUser(null);


return (
<AuthContext.Provider value={{ user, login, logout }}>
{children}
</AuthContext.Provider>
);
}