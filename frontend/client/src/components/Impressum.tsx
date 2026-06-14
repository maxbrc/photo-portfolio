import { useState, useEffect } from "react";
import { SiteContent } from "../types/site";
import "../styles/impressum.css"

function Impressum() {
    const [text, setText] = useState<string | null>(null);

    useEffect(() => {
        fetch("/api/site-content")
            .then(res => res.json())
            .then((json: SiteContent) => setText(json.impressum))
            .catch(() => {});
    }, []);

    return (
        <>
            <h1>Impressum</h1>
            <div className="impressum">
                {text === null
                    ? <p>Lädt…</p>
                    : text.split("\n").map((line, i) =>
                        line === "" ? <br key={i} /> : <span key={i}>{line}<br /></span>
                    )
                }
            </div>
        </>
    )
}

export default Impressum