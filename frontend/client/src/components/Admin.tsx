import { Routes, Route, useNavigate, Navigate, useLocation } from "react-router";
import { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import { v4 as uuid } from "uuid";

import { SuccessfullLoginResponse, TokenValidationResponse } from "../types/admin";
import { MessageBadge, MessageBadgeTypes } from "../types/messages";

import Login from "./Login";
import AdminDashboard from "./AdminDashboard";
import AdminBaseLayout from "./AdminBaseLayout";
import AdminImages from "./AdminImages";
import AdminAlbums from "./AdminAlbums";
import AdminUsers from "./AdminUsers";
import NotFound from "./NotFound";
import AdminUtils from "./AdminUtils";
import AdminHomepage from "./AdminHomepage";

function Admin() {
    const [ accessToken, setAccessToken ] = useState<string | null>("");
    const [ loading, setLoading ] = useState(true);
    const [ sessionValid, setSessionValid ] = useState(false);
    const [ messages, setMessages ] = useState<MessageBadge[]>([]);
    const navigate = useNavigate()
    const location = useLocation()

    function createMessage(type: MessageBadgeTypes, message: string, replaceIndentical?: boolean): void {
        const newMessage: MessageBadge = {
            uuid: uuid(),
            type: type,
            message: message
        }

        if (replaceIndentical !== true) {
            setMessages(currMessages => [...currMessages, newMessage])
        } else {
            setMessages(currMessages => {
                const newMessages = [...currMessages]
                if (newMessages[newMessages.length - 1]?.message === newMessage.message) newMessages[newMessages.length - 1] = newMessage
                else newMessages.push(newMessage)
                return newMessages
            })
        }

        setTimeout(() => {
            setMessages(currMessages => currMessages.filter(el => el.uuid !== newMessage.uuid))
        }, 5000)
    }

    const checkTokenValid = (token: string | null): TokenValidationResponse => {
        if (!token) {
            return {
                valid: false,
                leewayUsed: false
            }
        }

        const parsedToken = jwtDecode(token)
        const tokenExpiresAt = parsedToken.exp!
        const currentTime = Math.floor(Date.now() / 1000)

        const tokenValid = currentTime <= tokenExpiresAt 
        const leewayUsed = currentTime >= tokenExpiresAt-30 && currentTime <= tokenExpiresAt

        return {
            valid: tokenValid,
            leewayUsed: leewayUsed
        }
    }

    const validateSession = async (): Promise<string | null> => {
        let tokenToUse = accessToken
        let sessionValidTracker = false
        const validationResponse = checkTokenValid(accessToken)
        if (!validationResponse.valid || validationResponse.leewayUsed) {
            tokenToUse = await tryRefresh()
            sessionValidTracker = checkTokenValid(tokenToUse).valid
        } else {
            sessionValidTracker = true
        }

        setSessionValid(sessionValidTracker)
        if (sessionValidTracker) {
             setLoading(false)
        }
        console.log("Ran session validation, is your session valid:", sessionValidTracker)
        return sessionValidTracker ? tokenToUse : null
    }

    const tryRefresh = async (): Promise<string | null> => {
        const res = await fetch("/api/refresh-token", {
            credentials: "include"
        })

        if (res.ok) {
            const json: SuccessfullLoginResponse = await res.json()
            setAccessToken(json.access_token)
            return json.access_token

        } else {
            setAccessToken(null)
            if (location.pathname !== "/admin/login") {
                createMessage(MessageBadgeTypes.ERROR, "Nicht authentifiziert!")
            }
            navigate("/admin/login", {
                replace: true
            })
            
            return null
        }
    }

    useEffect(() => {
        const run = async () => {
            console.info("maxbrc Admin component mounted, running initial session validation...")
            await validateSession()
        }
        run()
    }, [])

    return (
        <Routes>
            <Route path="login" element={<Login messages={messages} createMessage={createMessage} setAccessToken={setAccessToken} sessionValid={sessionValid} validateSession={validateSession} />} />
            <Route element={<AdminBaseLayout loading={loading}/>}>
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="management/images" element={<AdminImages validateSession={validateSession} messages={messages} createMessage={createMessage} accessToken={accessToken} />} />
                <Route path="management/albums" element={<AdminAlbums validateSession={validateSession} messages={messages} createMessage={createMessage} accessToken={accessToken} />} />
                <Route path="management/users" element={<AdminUsers validateSession={validateSession} messages={messages} createMessage={createMessage} accessToken={accessToken} />} />
                <Route path="management/utils" element={<AdminUtils validateSession={validateSession} messages={messages} createMessage={createMessage} accessToken={accessToken} />} />
                <Route path="management/homepage" element={<AdminHomepage validateSession={validateSession} messages={messages} createMessage={createMessage} accessToken={accessToken} />} />
            </Route>
            <Route path="*" element={<NotFound showAdminRedirectButton={true}/>} />
        </Routes>
    )
}

export default Admin