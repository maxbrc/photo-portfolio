import { Outlet } from "react-router";

import "../styles/admin_base.css";

function AdminBaseLayout({ loading }: { loading: boolean; }) {
    return (
        <div className="dashboard">
            {loading ? <div id="loading">
                <h1>Loading...</h1>
                <sub>Du darfst das noch nicht sehen...</sub>
            </div> : <Outlet />}
        </div>
    )
}

export default AdminBaseLayout