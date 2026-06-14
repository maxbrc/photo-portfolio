import { Link } from "react-router";

import "../styles/admin_dashboard.css";

function AdminDashboard() {
    return (
        <div className="dashboard-admin">
            <h1>Admin Dashboard</h1>
            <div className="dashboard-buttons">
                <div>
                    <h2>Bilder</h2>
                    <button className="dashboard-button"><Link to="/admin/management/images">Bildermanagement</Link></button>
                </div>
                <div>
                    <h2>Alben</h2>
                    <button className="dashboard-button"><Link to="/admin/management/albums">Albenmanagement</Link></button>
                </div>
                <div>
                    <h2>Nutzer</h2>
                    <button className="dashboard-button"><Link to="/admin/management/users">Nutzermanagement</Link></button>
                </div>
                <div>
                    <h2>Utilities</h2>
                    <button className="dashboard-button"><Link to="/admin/management/utils">Utility Funktionen</Link></button>
                </div>
                <div>
                    <h2>Homepage</h2>
                    <button className="dashboard-button"><Link to="/admin/management/homepage">Homepage bearbeiten</Link></button>
                </div>
                <div>
                    <h2>Front Page</h2>
                    <button className="dashboard-button"><Link to="/">Zur Front Page</Link></button>
                </div>
            </div>
        </div>
    )
}
export default AdminDashboard