import { useState } from 'react';
import { useApps } from '../context/AppsContext';


export default function AddApplication() {
const { addApplication } = useApps();
const [company, setCompany] = useState('');
const [title, setTitle] = useState('');


const submit = e => {
e.preventDefault();
addApplication({ company, title });
setCompany('');
setTitle('');
};


return (
<form onSubmit={submit}>
<input placeholder="Company" value={company} onChange={e => setCompany(e.target.value)} />
<input placeholder="Job Title" value={title} onChange={e => setTitle(e.target.value)} />
<button>Add</button>
</form>
);
}