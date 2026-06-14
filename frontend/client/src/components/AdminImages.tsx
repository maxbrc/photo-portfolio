import { useNavigate } from "react-router";

import ImageBrowser from "./ImageBrowser";
import ErrorList from "./MessageList";

import { MessageBadge, MessageBadgeTypes } from "../types/messages";

function AdminImages({ validateSession, messages, createMessage, accessToken }: { validateSession: () => Promise<string | null>; messages: MessageBadge[], createMessage: (type: MessageBadgeTypes, message: string) => void; accessToken: string | null; }) {
    const navigate = useNavigate();

    return (
        <>
            <ErrorList messages={messages}/>
            <div className="albums-top" style={{ padding: "1.25rem 1.25rem 0" }}>
                <img
                    src="/assets/home.svg"
                    className="albums-home-icon"
                    onClick={(e: React.MouseEvent) => { e.stopPropagation(); navigate("/admin/dashboard") }}
                />
                <div className="albums-top-divider" />
                <span className="albums-title">Bildermanagement</span>
            </div>
            <ImageBrowser
                validateSession={validateSession}
                createMessage={createMessage}
            />
        </>
            )
}

export default AdminImages