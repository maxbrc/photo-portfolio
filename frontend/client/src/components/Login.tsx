import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { IconLayoutDashboard, IconPencil, IconEye, IconEyeOff } from "@tabler/icons-react"

import { SuccessfullLoginResponse } from "../types/admin";
import { MessageBadge, MessageBadgeTypes } from "../types/messages";
import MessageList from "./MessageList";

import "../styles/login.css"

function Login({ messages, createMessage, setAccessToken, sessionValid, validateSession }: { messages: MessageBadge[], createMessage: (type: MessageBadgeTypes, message: string) => void; setAccessToken: (newToken: string) => void; sessionValid: boolean; validateSession: () => Promise<string | null>; }) {
    const navigate = useNavigate()

    useEffect(() => {
        if (sessionValid) {
            navigate("/admin/dashboard", {
                replace: true
            })
        }
    }, [sessionValid])

    const [ username, setUsername ] = useState("")
    const [ password, setPassword ] = useState("")
    const [ showPassword, setShowPassword ] = useState(false)

    const postLogin = async () => {
        try {
            const res = await fetch("/api/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    "username": username,
                    "password": password
                })
            })

            let json: any = null;

            const contentType = res.headers.get("Content-Type") || "";
            if (contentType.includes("application/json") && res.ok) {
                json = await res.json();
            } else {
                const text = await res.text();
                createMessage(MessageBadgeTypes.ERROR, text)
                setPassword("")
                setUsername("")
                return
            }

            if (!res.ok) {
                console.error("error")
            }

            setAccessToken((json as SuccessfullLoginResponse).access_token)
            validateSession()
        } catch (e) {
            console.error("Error!", e)
        }
    }

    return (
        <div className="login">
            <MessageList messages={messages} />
            <span style={{ display: "none" }}>Du hast das geheime Admin Interface gefunden. Autorisierung geschieht mittels JWT. Backend ist in Go. Max @ maxbrc.com</span>
            <h1>Management</h1>
            <h2>Richards geheimes Interface</h2>
            <form className="login-form">
                <div className="login-field">
                    <span className="login-label">Benutzername</span>
                    <div className="login-input-wrap">
                        <input
                            className="login-input"
                            value={username}
                            type="text"
                            id="username"
                            onChange={(e) => setUsername(e.target.value)}
                        />
                    </div>
                </div>
                <div className="login-field">
                    <span className="login-label">Passwort</span>
                    <div className="login-input-wrap">
                        <input
                            className="login-input"
                            value={password}
                            type={showPassword ? "text" : "password"}
                            id="password"
                            style={{ paddingRight: "2.5rem" }}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <div className="login-eye" onClick={() => setShowPassword(v => !v)}>
                            {showPassword ? <IconEyeOff size={16} stroke={1.5} /> : <IconEye size={16} stroke={1.5} />}
                        </div>
                    </div>
                </div>
                <button
                    className="login-btn"
                    onClick={(e) => { e.preventDefault(); postLogin() }}
                >
                    Login
                </button>
            </form>
        </div>
    )
}

export default Login