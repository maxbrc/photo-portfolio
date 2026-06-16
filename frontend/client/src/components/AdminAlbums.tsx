import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { IconArrowLeft, IconPhoto, IconPencil, IconChevronUp, IconChevronDown, IconPlus, IconX, IconTrash, IconCheck, IconSelector } from "@tabler/icons-react"

import ImageBrowser from "./ImageBrowser";

import { Album } from "../types/albums";
import { Image } from "../types/images";
import { MessageBadge, MessageBadgeTypes } from "../types/messages";
import MessageList from "./MessageList";

import "../styles/admin_albums.css";

function AdminAlbums({ validateSession, messages, createMessage, accessToken }: { validateSession: () => Promise<string | null>; messages: MessageBadge[], createMessage: (type: MessageBadgeTypes, message: string, replaceIdentical?: boolean) => void; accessToken: string | null; }) {
    const navigate = useNavigate();
    
    const [ editAlbum, setEditAlbum ] = useState<{ album: Album, initialCreate?: boolean } | null>(null);
    const [ selectorOpen, setSelectorOpen ] = useState(false);
    const [ albums, setAlbums ] = useState<Album[]>([])

    const fetchAlbums = async () => {
        const res = await fetch("/api/albums")
        const json: Album[] = await res.json()
        setAlbums([...json].sort((a, b) => b.rank - a.rank))
    }

    useEffect(() => {
        fetchAlbums()
        .catch(e => console.error(e))
    }, [])

    const updateAlbum = async () => {
        if (editAlbum === null) {
            console.log("How did you do this!?")
            return
        }

        if (editAlbum.album.name === "" || editAlbum.album.cover_image_uuid === null) {
            createMessage(MessageBadgeTypes.INFO, "Bitte Name und Bild vergeben")
            return
        }

        const tokenToUse = await validateSession()
        if (!tokenToUse) return

        const res = await fetch("/api/albums", {
            method: "PUT",
            headers: {
                "Authorization": "Bearer " + tokenToUse,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(editAlbum.album)
        })

        if (res.ok) {
            createMessage(MessageBadgeTypes.SUCCESS, "Album aktualisiert")
        } else {
            const text = await res.text()
            createMessage(MessageBadgeTypes.ERROR, `Fehler: ${text}`)
        }

        setEditAlbum(null)
        fetchAlbums()
    }

    const deleteAlbum = async () => {
        const tokenToUse = await validateSession()
        if (!tokenToUse) return
        const res = await fetch(`/api/albums/${editAlbum?.album.id}`, {
            method: "DELETE",
            headers: {
                "Authorization": "Bearer " + tokenToUse
            }
        })

        if (res.ok) {
            createMessage(MessageBadgeTypes.SUCCESS, "Album gelöscht")
        } else {
            const text = await res.text()
            createMessage(MessageBadgeTypes.ERROR, `Fehler: ${text}`)
        }

        setEditAlbum(null)
        fetchAlbums()
    }

    const createAlbum = async () => {
        const albumIDs = albums.map(el => el.id)
        const newAlbumID = albumIDs.length > 0 ? (Math.max(...albumIDs) + 1) : 1
        const newRank = albums.length > 0 ? Math.max(...albums.map(a => a.rank)) + 1 : 1

        const newEditAlbum: Album = {
            id: newAlbumID,
            name: "",
            cover_image_uuid: null,
            rank: newRank
        }

        setEditAlbum({ album: newEditAlbum, initialCreate: true })
    }

    const postAlbum = async () => {
        if (editAlbum === null) {
            console.log("How did you do this!?")
            return
        }

        if (editAlbum.album.name === "" || editAlbum.album.cover_image_uuid === null) {
            createMessage(MessageBadgeTypes.INFO, "Bitte Name und Bild vergeben")
            return
        }

        const tokenToUse = await validateSession()
        if (!tokenToUse) return

        const res = await fetch("/api/albums", {
            method: "POST",
            headers: {
                "Authorization": "Bearer " + tokenToUse
            },
            body: JSON.stringify(editAlbum.album)
        })

        if (res.ok) {
            createMessage(MessageBadgeTypes.SUCCESS, "Album erstellt")
        } else {
            const text = await res.text()
            createMessage(MessageBadgeTypes.ERROR, `Fehler: ${text}`)
        }

        setEditAlbum(null)
        fetchAlbums()
    }

    const patchAlbumRank = async (albumID: number, rank: number) => {
        const tokenToUse = await validateSession()
        if (!tokenToUse) throw new Error("invalid access token")

        const res = await fetch(`/api/albums/${albumID}`, {
            method: "PATCH",
            body: JSON.stringify({ rank: rank }),
            headers: {
                "Authorization": "Bearer " + tokenToUse,
                "Content-Type": "application/json"
            }
        })

        if (!res.ok) throw new Error(await res.text())
    }

    const moveAlbum = async (albumID: number, up: boolean) => {
        const sorted = [...albums].sort((a, b) => b.rank - a.rank)
        const fromIndex = sorted.findIndex(a => a.id === albumID)
        const toIndex = up ? fromIndex - 1 : fromIndex + 1

        if (toIndex < 0 || toIndex >= sorted.length) return

        ;[sorted[toIndex], sorted[fromIndex]] = [
            { ...sorted[fromIndex], rank: sorted[toIndex].rank },
            { ...sorted[toIndex], rank: sorted[fromIndex].rank }
        ]

        setAlbums(sorted)

        try {
            await Promise.all([
                patchAlbumRank(sorted[toIndex].id, sorted[toIndex].rank),
                patchAlbumRank(sorted[fromIndex].id, sorted[fromIndex].rank)
            ])
            createMessage(MessageBadgeTypes.SUCCESS, "Anordnung aktualisiert")
        } catch (e) {
            createMessage(MessageBadgeTypes.ERROR, String(e))
        }
    }

    return (
        <>
            <MessageList messages={messages} />
            <div className="admin-albums">
                <div className="albums-top">
                    <img
                        src="/assets/home.svg"
                        className="albums-home-icon"
                        onClick={() => navigate("/admin/dashboard")}
                    />
                    <div className="albums-top-divider" />
                    <span className="albums-title">Albenmanagement</span>
                </div>

                <div className="albums-grid">
                    {albums.map((el) => (
                        <div className="album-card" key={el.id} onClick={() => setEditAlbum({ album: el })}>
                            <div className="album-card-cover">{el.cover_image_uuid
                                                            ? <img src={`/photos/${el.cover_image_uuid}.webp?width=400&height=0`} />
                                                            : <IconPhoto size={32} stroke={1} />
                                                        }</div>
                            <div className="album-card-edit">
                                <IconPencil size={14} stroke={1.5} />
                            </div>
                            <div className="album-card-footer">
                                <div className="album-card-order" onClick={e => e.stopPropagation()}>
                                    <button className="order-btn" onClick={() => moveAlbum(el.id, true)}><IconChevronUp size={11} stroke={1.5} /></button>
                                    <button className="order-btn" onClick={() => moveAlbum(el.id, false)}><IconChevronDown size={11} stroke={1.5} /></button>
                                </div>
                                <span className="album-card-name">{el.name}</span>
                            </div>
                        </div>
                    ))}
                </div>

                <button className="albums-new-btn" onClick={createAlbum}>
                    <IconPlus size={16} stroke={1.5} /> Neues Album
                </button>

                {editAlbum != null &&
                    <form onClick={() => { setEditAlbum(null); setSelectorOpen(false); fetchAlbums() }}>
                        <div className="albums-panel" onClick={e => e.stopPropagation()}>
                            <div className="albums-panel-head">
                                <span className="albums-panel-lbl">
                                    {editAlbum.initialCreate ? "Album erstellen" : "Album bearbeiten"}
                                </span>
                                <div className="albums-panel-x" onClick={() => { setEditAlbum(null); setSelectorOpen(false) }}>
                                    <IconX size={20} stroke={1.5} />
                                </div>
                            </div>

                            <div className="albums-field">
                                <span className="albums-flabel">Name</span>
                                <input
                                    className="albums-finput"
                                    placeholder="Name wählen"
                                    value={editAlbum.album.name}
                                    onClick={e => e.stopPropagation()}
                                    onChange={e => setEditAlbum(curr => curr ? { ...curr, album: { ...curr.album, name: e.target.value } } : null)}
                                />
                            </div>

                            <div className="albums-field">
                                <div className="albums-cover-wrapper">
                                    <span className="albums-flabel">Coverbild</span>
                                    <div className="albums-cover-preview" onClick={e => { e.stopPropagation(); e.preventDefault(); setSelectorOpen(true) }}>
                                        {editAlbum.album.cover_image_uuid
                                            ? <img src={`/photos/${editAlbum.album.cover_image_uuid}.webp?width=400&height=0`} />
                                            : <IconPhoto size={28} stroke={1} />
                                        }
                                        <div className="albums-sel-overlay">
                                            <IconPencil size={15} stroke={1.5} /> Ändern
                                        </div>
                                    </div>
                                </div>
                                {selectorOpen && (
                                    <div className="dropdown-image-browser" onClick={(e) => { e.stopPropagation(); setSelectorOpen(false) }}>
                                        <div onClick={e => e.stopPropagation()}>
                                            <div className="dropdown-image-browser-x" onClick={() => setSelectorOpen(false)}>
                                                <IconX size={18} stroke={1.5} />
                                            </div>
                                            <ImageBrowser
                                                validateSession={validateSession}
                                                selectedImageCallbackFn={(selectedImage) => {
                                                    setEditAlbum(curr => curr ? { ...curr, album: { ...curr.album, cover_image_uuid: selectedImage.uuid } } : null)
                                                    setSelectorOpen(false)
                                                }}
                                                selectOnly={true}
                                                createMessage={createMessage}
                                                preselectAlbumID={editAlbum.initialCreate ? undefined : editAlbum.album.id}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="albums-actions">
                                <button className="albums-abtn albums-abtn-del" onClick={e => { e.stopPropagation(); e.preventDefault(); deleteAlbum() }}>
                                    <IconTrash size={14} stroke={1.5} /> Löschen
                                </button>
                                <button className="albums-abtn albums-abtn-save" onClick={e => { e.stopPropagation(); e.preventDefault(); editAlbum.initialCreate ? postAlbum() : updateAlbum() }}>
                                    <IconCheck size={14} stroke={1.5} /> {editAlbum.initialCreate ? "Erstellen" : "Speichern"}
                                </button>
                            </div>
                        </div>
                    </form>
                }
            </div>
        </>
    )
}

export default AdminAlbums