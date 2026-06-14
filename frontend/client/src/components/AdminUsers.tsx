import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { IconPencil, IconPlus, IconX, IconTrash, IconCheck } from "@tabler/icons-react";

import MessageList from "./MessageList";

import { MessageBadge, MessageBadgeTypes } from "../types/messages"

import "../styles/admin_users.css"

interface User {
    id: number;
    username: string;
}

function AdminUsers({ validateSession, messages, createMessage, accessToken }: { validateSession: () => Promise<string | null>; messages: MessageBadge[], createMessage: (type: MessageBadgeTypes, message: string) => void; accessToken: string | null; }) {
    const navigate = useNavigate();

    const [ users, setUsers ] = useState<User[]>([]);
    const [ editUser, setEditUser ] = useState<User | null>(null);
    const [ isCreating, setIsCreating ] = useState(false);
    const [ password, setPassword ] = useState("");

    const fetchUsers = async () => {
        const tokenToUse = await validateSession()
        if (!tokenToUse) return
        const res = await fetch("/api/users", {
            headers: { "Authorization": "Bearer " + tokenToUse }
        })

        if (!res.ok) {
            createMessage(MessageBadgeTypes.ERROR, `Fehler: ${await res.text()}`)
            return
        }

        setUsers(await res.json())
    }

    useEffect(() => {
        fetchUsers()
    }, [])

    const closePanel = () => {
        setEditUser(null)
        setIsCreating(false)
        setPassword("")
    }

    const saveUser = async () => {
        if (editUser === null) return

        const tokenToUse = await validateSession()
        if (!tokenToUse) return

        const url = isCreating ? "/api/users" : `/api/users/${editUser.id}`
        const method = isCreating ? "POST" : "PATCH"

        const res = await fetch(url, {
            method,
            headers: { "Authorization": "Bearer " + tokenToUse },
            body: JSON.stringify({ username: editUser.username, password })
        })

        if (res.ok) {
            createMessage(MessageBadgeTypes.SUCCESS, isCreating ? "Nutzer erstellt" : "Nutzer aktualisiert")
        } else {
            createMessage(MessageBadgeTypes.ERROR, `Fehler: ${await res.text()}`)
        }

        closePanel()
        fetchUsers()
    }

    const deleteUser = async () => {
        if (editUser === null) return

        const tokenToUse = await validateSession()
        if (!tokenToUse) return

        const res = await fetch(`/api/users/${editUser.username}`, {
            method: "DELETE",
            headers: { "Authorization": "Bearer " + tokenToUse }
        })

        if (res.ok) {
            createMessage(MessageBadgeTypes.SUCCESS, "Nutzer gelöscht")
        } else {
            createMessage(MessageBadgeTypes.ERROR, `Fehler: ${await res.text()}`)
        }

        closePanel()
        fetchUsers()
    }

    return (
        <>
            <MessageList messages={messages} />
            <div className="admin-users">
                <div className="users-top">
                    <img
                        src="/assets/home.svg"
                        className="users-home-icon"
                        onClick={() => navigate("/admin/dashboard")}
                    />
                    <div className="users-top-divider" />
                    <span className="users-title">Nutzerverwaltung</span>
                </div>

                <div className="users-list">
                    {users.map(el => (
                        <div className="user-row" key={el.id}>
                            <span className="user-id">#{el.id}</span>
                            <span className="user-name">{el.username}</span>
                            <button className="user-edit-btn" onClick={() => { setIsCreating(false); setEditUser(el) }}>
                                <IconPencil size={13} stroke={1.5} />
                            </button>
                        </div>
                    ))}
                </div>

                <button className="users-new-btn" onClick={() => { setIsCreating(true); setEditUser({ id: 0, username: "" }) }}>
                    <IconPlus size={16} stroke={1.5} /> Neuer Nutzer
                </button>

                {editUser !== null && (
                    <form onClick={closePanel}>
                        <div className="users-panel" onClick={e => e.stopPropagation()}>
                            <div className="users-panel-head">
                                <span className="users-panel-lbl">
                                    {isCreating ? "Nutzer erstellen" : "Nutzer bearbeiten"}
                                </span>
                                <div className="users-panel-x" onClick={closePanel}>
                                    <IconX size={20} stroke={1.5} />
                                </div>
                            </div>

                            <div className="users-field">
                                <span className="users-flabel">Benutzername</span>
                                <input
                                    className="users-finput"
                                    placeholder="Benutzername wählen"
                                    value={editUser.username}
                                    onClick={e => e.stopPropagation()}
                                    onChange={e => setEditUser(curr => curr ? { ...curr, username: e.target.value } : null)}
                                />
                            </div>

                            <div className="users-field">
                                <span className="users-flabel">{isCreating ? "Passwort" : "Passwort ändern"}</span>
                                <input
                                    className="users-finput"
                                    type="password"
                                    placeholder={isCreating ? "Passwort" : "Neues Passwort"}
                                    value={password}
                                    onClick={e => e.stopPropagation()}
                                    onChange={e => setPassword(e.target.value)}
                                />
                            </div>

                            <div className="users-actions">
                                {!isCreating && (
                                    <button
                                        className="users-abtn users-abtn-del"
                                        disabled={editUser.id === 1}
                                        onClick={e => { e.stopPropagation(); e.preventDefault(); deleteUser() }}
                                    >
                                        <IconTrash size={14} stroke={1.5} /> Löschen
                                    </button>
                                )}
                                <button
                                    className="users-abtn users-abtn-save"
                                    onClick={e => { e.stopPropagation(); e.preventDefault(); saveUser() }}
                                >
                                    <IconCheck size={14} stroke={1.5} /> {isCreating ? "Erstellen" : "Speichern"}
                                </button>
                            </div>
                        </div>
                    </form>
                )}
            </div>
        </>
    )
}

export default AdminUsers
