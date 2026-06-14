import { useState, useEffect } from "react";
import { useLocation, Link } from "react-router";

import "../styles/header.css";

function Header() {
    const location = useLocation();

    const [ dropdownOpen, setDropdownOpen ] = useState(false);
    const [ dropdownProps, setDropdownProps ] = useState({dark: false, shrink: false})
    const [ navOpen, setNavOpen ] = useState(false);

    useEffect(() => {
        window.scrollTo(0, 0)
    }, [location])

    useEffect(() => {
        const handleScroll = () => {
            const currentScroll = window.pageYOffset
            if (currentScroll > 50) {
                setDropdownProps(currProps => ({...currProps, dark: true}))
            } else {
                setDropdownProps(currProps => ({...currProps, dark: false}))
            }
        }

        window.addEventListener("scroll", handleScroll)
        return () => window.removeEventListener("scroll", handleScroll)
    }, [])

    const toggleNav = () => {
        const opening = !dropdownOpen
        if (opening) {
            const scrollY = window.scrollY
            document.body.style.position = "fixed"
            document.body.style.top = `-${scrollY}px`
            document.body.style.width = "100%"
        } else {
            const scrollY = parseInt(document.body.style.top || "0") * -1
            document.body.style.position = ""
            document.body.style.top = ""
            document.body.style.width = ""
            window.scrollTo(0, scrollY)
        }
        setDropdownOpen(opening)
        setNavOpen(opening)
    }

    return (
        <header className={`${dropdownProps.dark ? "dark" : ""} ${navOpen ? "nav-open" : ""}`}>
            <div className="spacer"></div>
            {location.pathname === "/" && (
                <Link to="/gallery" className="gallery-hint">
                    Gallery <span className="gallery-hint-arrow">→</span>
                </Link>
            )}
            <div className={`burger ${dropdownOpen ? "active" : ""}`} onClick={toggleNav}>
                <span></span>
                <span></span>
                <span></span>
            </div>
            <nav className={navOpen ? "" : "hidden"}>
                <ul>
                    <li onClick={toggleNav}><Link to="/" className={location.pathname=="/" ? "active" : ""}>Home</Link></li>
                    <li onClick={toggleNav}><Link to="/gallery" className={location.pathname=="/gallery" ? "active" : ""}>Gallery</Link></li>
                    <li onClick={toggleNav} className="impressum"><Link to="/impressum" className={location.pathname=="/impressum" ? "active" : ""}>Impressum</Link></li>
                </ul>
            </nav>
        </header>
    )
}

export default Header
