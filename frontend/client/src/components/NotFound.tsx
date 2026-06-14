import { Link } from "react-router";

import "../styles/not_found.css"

function NotFound({ showAdminRedirectButton }: { showAdminRedirectButton?: boolean; }) {
    return (
        <div className="not-found">
            <h1>404</h1>
            <p>Die angefragte Seite existiert nicht.</p>
            <div className="not-found-btns">
                {showAdminRedirectButton && <button className="dashboard-button"><Link to="/admin/login">Admin Interface</Link></button>}
                <button className="dashboard-button"><Link to="/">Zur Startseite</Link></button>
            </div>
        </div>
    )
}

export default NotFound