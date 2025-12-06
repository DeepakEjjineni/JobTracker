import { useApps } from '../context/AppsContext';


export default function Applications() {
const { applications, deleteApplication } = useApps();
return (
<ul>
{applications.map(app => (
<li key={app.id}>{app.company} - {app.title} <button onClick={() => deleteApplication(app.id)}>Delete</button></li>
))}
</ul>
);
}