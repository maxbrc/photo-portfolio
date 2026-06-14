import { useNavigate } from "react-router";
import { IconBolt } from "@tabler/icons-react";

import MessageList from "./MessageList";

import { MessageBadge, MessageBadgeTypes } from "../types/messages";

import "../styles/admin_utils.css";

function AdminUtils({ validateSession, messages, createMessage, accessToken }: { validateSession: () => Promise<string | null>; messages: MessageBadge[], createMessage: (type: MessageBadgeTypes, message: string) => void; accessToken: string | null; }) {
    const navigate = useNavigate();

    const cleanUpImages = async (): Promise<void> => {
        const tokenToUse = await validateSession()
        if (!tokenToUse) return

        const res = await fetch("/api/images/cleanup", {
            method: "POST",
            headers: { "Authorization": "Bearer " + tokenToUse }
        })

        if (res.ok) {
            const json: number = await res.json()
            createMessage(MessageBadgeTypes.SUCCESS, `Es wurden ${json} Bilddateien bereinigt.`)
        } else {
            createMessage(MessageBadgeTypes.ERROR, `Fehler: ${await res.text()}`)
        }
    }

    return (
        <>
            <MessageList messages={messages} />
            <div className="admin-utils">
                <div className="utils-top">
                    <img
                        src="/assets/home.svg"
                        className="utils-home-icon"
                        onClick={() => navigate("/admin/dashboard")}
                    />
                    <div className="utils-top-divider" />
                    <span className="utils-title">Utilities</span>
                </div>

                <div className="utils-section">
                    <div className="utils-section-info">
                        <span className="utils-section-name">Bilddateien bereinigen</span>
                        <span className="utils-section-desc">Löscht Bilddateien ohne zugehörigen Eintrag in der Datenbank.</span>
                    </div>
                    <button className="utils-action-btn" onClick={cleanUpImages}>
                        <IconBolt size={14} stroke={1.5} /> Cleanup
                    </button>
                </div>
            </div>
        </>
    )
}

export default AdminUtils
