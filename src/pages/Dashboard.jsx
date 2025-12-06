import { useApps } from '../context/AppsContext';


export default function Dashboard() {
const { applications } = useApps();
return <h3>Total Applications: {applications.length}</h3>;
}