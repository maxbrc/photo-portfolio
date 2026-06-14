import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { IconLayoutDashboard, IconUserCircle } from "@tabler/icons-react"

import { SiteContent } from "../types/site"

import "../styles/home.css"

function Home() {
    const [ viewportHeight, setViewportHeight ] = useState("100dvh");
    const [ authenticated, setAuthenticated ] = useState(false);
    const [ siteContent, setSiteContent ] = useState<SiteContent | null>(null)
    const [ loading, setLoading ] = useState(true)
    const [ loadingMessage, setLoadingMessage ] = useState<string>("Seite lädt...")

    const navigate = useNavigate();

    useEffect(() => {
    if (typeof window === "undefined") return; // SSR guard

    const handleOrientationChange = () => {
        // Delay ensures correct height after rotation settles
        setTimeout(() => {
        setViewportHeight(`${window.innerHeight}px`);
        }, 50);
    };

    // Initial update on mount
    handleOrientationChange();

    // Only listen on client
    window.addEventListener("orientationchange", handleOrientationChange);

    return () => {
        window.removeEventListener("orientationchange", handleOrientationChange);
    };
    }, []);

    useEffect(() => {
        fetch("/api/refresh-token", { credentials: "include" })
            .then(res => { if (res.ok) setAuthenticated(true) })
            .catch(() => {})
    }, [])

    useEffect(() => {
        if (authenticated) document.body.setAttribute("data-auth", "")
        return () => document.body.removeAttribute("data-auth")
    }, [authenticated])

    const fetchSiteContent = async () => {
        const res = await fetch("/api/site-content")

        if (!res.ok) {
            setLoadingMessage("Ein Fehler ist aufgetreten")
            return
        }

        const json: SiteContent = await res.json()

        setSiteContent(json)
        setLoading(false)
    }

    useEffect(() => {
        fetchSiteContent()
    }, [])

    return (
        <>
            {loading && (
                <div className="home-loading">
                    <span>{loadingMessage}</span>
                </div>
            )}
            {authenticated &&
                <div className="auth-bar">
                    <span className="auth-bar-label">Authentifiziert</span>
                    <div className="auth-bar-divider" />
                    <button className="auth-bar-btn" onClick={() => navigate("/admin/dashboard")}>
                        <IconLayoutDashboard size={13} stroke={1.5} />
                        Admin Dashboard
                    </button>
                </div>
            }
            <section className="home-banner" style={{ height: viewportHeight }}>
                {siteContent?.hero.image_uuid && (
                    <img className="home-banner-img" src={`/photos/${siteContent.hero.image_uuid}.webp?width=1920&height=1080`} alt="Hero" />
                )}
                <div className="home-banner-content">
                    <h1>{siteContent?.hero.title ?? "Richard Freier"}</h1>
                    <h2>{siteContent?.hero.subtitle ?? "Street Photographer"}</h2>
                </div>
            </section>
            <section className="socials">
                <h3>Socials</h3>
                {siteContent?.socials.map((social, i) => (
                    <div className="social-badge" key={i}>
                        <img src={`/assets/${social.type}.png`} alt={`${social.type} Icon`} />
                        <ul>
                            {social.entries.map((entry, j) => (
                                <li key={j}><a href={entry.url} target="_blank">{entry.handle}</a></li>
                            ))}
                        </ul>
                    </div>
                ))}
            </section>
            <section>
                <h3>About Me</h3>
                {siteContent?.about.image_uuid
                    ? <img className="profile" src={`/photos/${siteContent.about.image_uuid}.webp?width=200&height=200`} alt="Profilbild" />
                    : <IconUserCircle className="profile-placeholder" size={112} stroke={0.6} />
                }
                <span>
                    {siteContent?.about.text.split("\n").map((line, i) => (
                        <span key={i}>{line}<br/></span>
                    ))}
                </span>
            </section>
            <section>
                <h3>Equipment</h3>
                <ul>
                    {siteContent?.equipment.map((item, i) => (
                        <li key={i}>{item}</li>
                    ))}
                </ul>
            </section>
        </>
    )
}

export default Home