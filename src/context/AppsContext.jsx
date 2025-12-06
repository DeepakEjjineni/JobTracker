import { createContext, useContext, useState } from 'react';


const AppsContext = createContext();


export function AppsProvider({ children }) {
const [applications, setApplications] = useState([]);


const addApplication = (app) => {
setApplications(prev => [{ id: Date.now(), ...app }, ...prev]);
};


const deleteApplication = (id) => {
setApplications(prev => prev.filter(a => a.id !== id));
};


return (
<AppsContext.Provider value={{ applications, addApplication, deleteApplication }}>
{children}
</AppsContext.Provider>
);
}