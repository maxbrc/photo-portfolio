import { useState, useEffect, useMemo, useRef } from "react";
import { IconCloudUpload, IconUpload, IconBolt, IconLoader, } from "@tabler/icons-react"

import AlbumSelector from "./AlbumSelector";

import { Image } from "../types/images";
import { MessageBadge, MessageBadgeTypes } from "../types/messages";
import { FetchedAlbumImageAssignment, AlbumImageAssignment } from "../types/albums";

import "../styles/image_browser.css"

function ImageBrowser({ validateSession, createMessage, selectedImageCallbackFn, selectOnly = false, preselectAlbumID }: { validateSession: () => Promise<string | null>; createMessage: (type: MessageBadgeTypes, message: string, replaceIdentical?: boolean) => void; selectedImageCallbackFn?: (image: Image) => void; selectOnly?: boolean; preselectAlbumID?: number }) {
    const [ images, setImages ] = useState<Image[]>([]);
    const [ files, setFiles ] = useState<FileList | null>(null);
    const [ focusedImage, setFocusedImage ] = useState<string | null>(null);
    const [ moreSettingsOpen, setMoreSettingsOpen ] = useState<boolean>(false);
    const [ currentAlbum, setCurrentAlbum ] = useState<number | null>(preselectAlbumID === undefined ? null : preselectAlbumID);
    const [ uploadOngoing, setUploadOngoing ] = useState<boolean>(false);
    const [ uploadProgress, setUploadProgress ] = useState<number>(0);
    const [ albumImageAssignments, setAlbumImageAssignments ] = useState<AlbumImageAssignment>({});
    const orderingDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

    const albumSelectorRef = useRef<{ close: () => void; isOpen: boolean }>(null)

    const fetchImages = async () => {
        const res = await fetch("/api/images")
        
        if (res.ok) {
            const json: Image[] = await res.json()

            setImages(json)
        } else {
            const errorMessage = await res.text()
            createMessage(MessageBadgeTypes.ERROR, `Fehler: ${errorMessage}`)
        }
    }

    const fetchAlbumImageAssignments = async () => {
        const res = await fetch("/api/albums/assignments")

        if (!res.ok) createMessage(MessageBadgeTypes.ERROR, `Fehler beim laden der Album-Bild Zuordnungen: ${await res.text()}`)

        const json: FetchedAlbumImageAssignment = await res.json();

        const parsedAssignments: AlbumImageAssignment = Object.fromEntries(
            Object.entries(json).map(([ albumID, assignedImages ]) => [ parseInt(albumID), assignedImages ])
        )

        setAlbumImageAssignments(parsedAssignments)
    }

    const imageAlbumMap = useMemo(() => {
        const map: Record<string, number[] | undefined> = {}
        Object.entries(albumImageAssignments).forEach(([albumID, images]) => {
            Object.keys(images).forEach(uuid => {
                if (!map[uuid]) map[uuid] = []
                map[uuid].push(parseInt(albumID))
            })
        })
        return map
    }, [albumImageAssignments])

    const handleGlobalClick = () => {
        if (albumSelectorRef.current?.isOpen) {
            albumSelectorRef.current?.close()
        } else if (moreSettingsOpen) {
            setMoreSettingsOpen(false)
        } else if (focusedImage) {
            setFocusedImage(null)
        }
    }

    const closeAllWindows = () => {
        albumSelectorRef.current?.close()
        setMoreSettingsOpen(false)
        setFocusedImage(null)
    }

    useEffect(() => {
        fetchImages()
        fetchAlbumImageAssignments()
    }, [])

    useEffect(() => {
        document.addEventListener("click", handleGlobalClick)
        return () => document.removeEventListener("click", handleGlobalClick)
    }, [moreSettingsOpen, setFocusedImage])

    const albumFilterMatches = (imageUUID: string, albumID: number | null) => {
        const albumsForImage = imageAlbumMap[imageUUID] ?? []

        if (albumID === -1) return true
        if (albumID === null) return albumsForImage.length === 0
        return albumsForImage.includes(albumID)
    }

    const filteredImages = useMemo(() => {
        const filteredImages = images.filter(img => albumFilterMatches(img.uuid, currentAlbum))

        if (currentAlbum === null) return filteredImages

        const sortedImages = filteredImages.sort((a, b) => {
            const rankA = albumImageAssignments[currentAlbum][a.uuid]
            const rankB = albumImageAssignments[currentAlbum][b.uuid]

            return rankA - rankB
        })

        return sortedImages
    }, [currentAlbum, images, albumImageAssignments])

    const deleteImage = async (uuid: string) => {
        const tokenToUse = await validateSession()
        if (!tokenToUse) return
        const res = await fetch(`/api/images/${uuid}`, {
            method: "DELETE",
            headers: {
                "Authorization": "Bearer " + tokenToUse
            },
        })

        if (res.ok) {
            createMessage(MessageBadgeTypes.SUCCESS, "Bild gelöscht")

            setImages(currImages => currImages.filter(img => img.uuid !== uuid))
        } else {
            const text = await res.text()
            createMessage(MessageBadgeTypes.ERROR, `Fehler: ${text}`)
        }
    }

    const updateImageRotation = async (uuid: string): Promise<void> => {
        const foundImage = filteredImages.find(el => el.uuid === uuid)!

        try {
            await updateImage(uuid, { landscape: !foundImage.landscape })
            createMessage(MessageBadgeTypes.SUCCESS, "Ausrichtung aktualisiert")
        } catch (e) {
            createMessage(MessageBadgeTypes.ERROR, getErrorMessage(e))
        }
        
    }

    const getErrorMessage = (error: unknown): string => {
        if (error instanceof Error) return error.message
        return String(error)
    }

    const assignImageToAlbums = async (uuid: string, toAlbums: number[]): Promise<void> => {
        const oldAlbumNumbers = imageAlbumMap[uuid] ?? []

        const added = toAlbums.filter(al => !oldAlbumNumbers.includes(al))
        const removed = oldAlbumNumbers.filter(albumID => !toAlbums.includes(albumID))

        let newAssignments = { ...albumImageAssignments }
        for (let albumID of added) {
            try {
                newAssignments[albumID] = await insertImagesIntoAssignments([uuid], albumID)
            } catch (e) {
                createMessage(MessageBadgeTypes.ERROR, "Fehler beim zuordnen: " + getErrorMessage(e))
            }
        }

        for (let albumID of removed) {
            const newAlbumAssignment = Object.fromEntries(Object.entries(newAssignments[albumID]).filter(([ u ]) => u !== uuid))
            newAssignments[albumID] = newAlbumAssignment
            console.log(newAlbumAssignment)
            try {
                await updateAssignments(albumID, newAlbumAssignment)
            } catch (e) {
                createMessage(MessageBadgeTypes.ERROR, "Fehler beim Löschen aus dem Album: " + getErrorMessage(e))
            }

            if (albumID === currentAlbum) closeAllWindows()
        }

        setAlbumImageAssignments(newAssignments)

        createMessage(MessageBadgeTypes.SUCCESS, "Zuordnung aktualisiert")
    }

    const updateImage = async (uuid: string, changes: object): Promise<void> => {
        setImages(currImages => currImages.map(img => img.uuid === uuid ? { ...img, ...changes } : img))

        const tokenToUse = await validateSession()
        if (!tokenToUse) throw new Error("invalid access token")

        const res = await fetch(`/api/images/${uuid}`, {
            method: "PATCH",
            body: JSON.stringify(changes),
            headers: {
                "Authorization": "Bearer " + tokenToUse
            }
        })

        //const json = await res.json();

        if (!res.ok) throw new Error(await res.text())
    }

    const moveImage = (uuid: string, up: boolean) => {
        if (currentAlbum === null) {
            createMessage(MessageBadgeTypes.INFO, "Du siehst nicht zugeordnete Bilder. Sortierung macht hier keinen Sinn :)")
            return
        }

        createMessage(MessageBadgeTypes.INFO, "Bitte beachte, dass die Anordnung je nach Gerätetyp leicht variiert! Aktualisierung folgt nach 5 Sekunden ohne Aktion.", true)

        const newAssignments = {...albumImageAssignments[currentAlbum]}
        const sorted = Object.entries(newAssignments).sort(([, a], [, b]) => a - b)
        const fromIndex = sorted.findIndex(([ u ]) => u === uuid)

        const toIndex = up ? fromIndex - 1 : fromIndex + 1

        if (toIndex < 0 || toIndex >= sorted.length) return

        [ newAssignments[sorted[fromIndex][0]], newAssignments[sorted[toIndex][0]] ] = [ newAssignments[sorted[toIndex][0]], newAssignments[sorted[fromIndex][0]] ]

        setAlbumImageAssignments(currAssignments => ({ ...currAssignments, [currentAlbum]: newAssignments }))

        if (orderingDebounceRef.current) clearTimeout(orderingDebounceRef.current)
        orderingDebounceRef.current = setTimeout(async () => {
            try {
                await updateAssignments(currentAlbum, newAssignments)
                createMessage(MessageBadgeTypes.SUCCESS, "Anordnung aktualisiert")
            } catch (e) {
                createMessage(MessageBadgeTypes.ERROR, getErrorMessage(e))
            }
        }, 5000)
    }

    const insertImagesIntoAssignments = async (imageUUIDs: string[], intoAlbum: number): Promise<Record<string, number>> => {
        const targetAlbumAssignmentObject = albumImageAssignments[intoAlbum] ?? {}
        let newAlbumAssignments = {...targetAlbumAssignmentObject}
        
        for (let uuid of imageUUIDs) {
            const shifted = Object.fromEntries(Object.entries(newAlbumAssignments).map(([ uuid, rank ]) => [ uuid, rank + 1]))

            newAlbumAssignments = {
                [uuid]: 1,
                ...shifted
            }
        }

        setAlbumImageAssignments(currAssignments => ({ ...currAssignments, [intoAlbum]: newAlbumAssignments }))

        try {
            await updateAssignments(intoAlbum, newAlbumAssignments)
        } catch (e) {
            createMessage(MessageBadgeTypes.ERROR, getErrorMessage(e))
        }

        return newAlbumAssignments
    }

    const updateAssignments = async (albumID: number, assignmentsObject: { [key: string]: number }) => {
        const tokenToUse = await validateSession()
        if (!tokenToUse) return

        const res = await fetch(`/api/albums/assignments/${albumID}`, {
            method: "PUT",
            body: JSON.stringify(assignmentsObject),
            headers: {
                "Authorization": "Bearer " + tokenToUse
            }
        })

        if (!res.ok) throw new Error(await res.text())
    }

    const postImage = async () => {
        let tokenToUse: string | null = null
        try {
            tokenToUse = await validateSession()
        } catch (e) {
            createMessage(MessageBadgeTypes.ERROR, "Fehler beim autorisieren der Sitzung: " + getErrorMessage(e))
            return
        }

        if (!tokenToUse) return

        if (files === null) {
            createMessage(MessageBadgeTypes.INFO, "Keine Bilder ausgewählt")
            return
        }

        const formData = new FormData();

        formData.append("file_count", files.length.toString())

        for (let i = 0; i < files.length; i++) {
            formData.append(`file${i}`, files[i]);
        }

        const res = await fetch("/api/images", {
            method: "POST",
            headers: {
                "Authorization": "Bearer " + tokenToUse
            },
            body: formData,
        });

        if (!res.ok) {
            createMessage(MessageBadgeTypes.ERROR, `Fehler beim Hochladen: ${await res.text()}`);
            return;
        }

        const json: Record<string, string> = await res.json();

        if (currentAlbum !== null) {
            const newImageUUIDs = Object.values(json)

            await insertImagesIntoAssignments(newImageUUIDs, currentAlbum)
        }

        createMessage(MessageBadgeTypes.SUCCESS, "Bild(er) erfolgreich hochgeladen")
        setFiles(null)
        fetchImages()
    }

    return (
        <div
            className="image-browser-main"
        >
            <h2>Album</h2>
            <AlbumSelector callbackFn={selectedAlbums => setCurrentAlbum(selectedAlbums.length === 0 ? null : selectedAlbums[0])} preselectOptions={preselectAlbumID === undefined ? undefined : [preselectAlbumID]}/>
            {!selectOnly && <h2>Upload</h2>}
            {!selectOnly && <div className="upload">
                <div className="upload-dropzone">
                    <input
                        type="file"
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFiles(e.target.files)}
                        multiple={true}
                        accept="image/jpeg, image/png, image/webp"
                    />
                    <IconCloudUpload size={28} stroke={1.5} />
                    <p className="drop-label">Bilder reindroppen oder <span>auswählen</span></p>
                    <p className="file-types">JPEG, PNG, WebP</p>
                </div>
                {files && files.length > 0 && (
                    <p className="files-selected">
                        {files.length} {files.length === 1 ? "Bild" : "Bilder"} ausgewählt
                    </p>
                )}

                <div className="upload-hint">
                    <IconBolt size={13} stroke={1.5} />
                    Bilder werden auf dem Server optimiert - das dauert eine Weile
                </div>

                {uploadOngoing && (
                    <div className="upload-progress">
                        <div className="progress-header">
                            <span className="progress-label">
                                <IconLoader size={13} stroke={1.5} />
                                Lädt hoch
                            </span>
                            <span className="progress-pct">{uploadProgress}%</span>
                        </div>
                        <div className="progress-track">
                            <div className="progress-fill" style={{ width: `${uploadProgress}%` }} />
                        </div>
                    </div>
                )}

                <button
                    onClick={postImage}
                    className="upload-btn"
                    disabled={uploadOngoing}
                >
                    <IconUpload size={15} stroke={1.5} />
                    Upload
                </button>
            </div>}
            <h2>Bilder</h2>
            <div className="image-browser">
            {
                filteredImages.length > 0 ? (
                    filteredImages.map(el => {
                        return (
                            <div
                                className={`image-container ${el.landscape ? "wide": ""}`}
                                key={el.uuid}
                                onClick={(e: React.MouseEvent) => {
                                    e.stopPropagation()
                                    if (focusedImage === el.uuid) {
                                        handleGlobalClick()
                                    } else {
                                        setMoreSettingsOpen(false)
                                        setFocusedImage(el.uuid)
                                    }

                                    if (selectedImageCallbackFn !== undefined) selectedImageCallbackFn(el)
                                }}
                            >
                                <img loading="lazy" src={`/photos/${el.uuid + ".webp"}?${el.landscape ? "height=333&width=500": "height=500&width=333"}`} />
                                <div className={focusedImage === el.uuid ? "image-settings" : "image-settings hidden"}>
                                    <div className="order-row">
                                        <div className="order-btn" onClick={(e) => { e.stopPropagation(); moveImage(el.uuid, true) }}>
                                            <img src="/assets/arrow-up.svg" />
                                        </div>
                                        <div className="order-btn" onClick={(e) => { e.stopPropagation(); moveImage(el.uuid, false) }}>
                                            <img src="/assets/arrow-down.svg" />
                                        </div>
                                    </div>
                                    <div className="middle-row">
                                        <div className="icon" onClick={(e) => { e.stopPropagation(); updateImageRotation(el.uuid); }}>
                                            <img src="/assets/rotate.svg" />
                                        </div>
                                        <div className="icon" onClick={(e) => { e.stopPropagation(); setMoreSettingsOpen(v => !v) }}>
                                            <img src="/assets/more.svg" />
                                        </div>
                                    </div>
                                    <div
                                        className={`more-panel ${moreSettingsOpen ? "open" : ""}`}
                                        onClick={e => e.stopPropagation()}
                                    >
                                        <div className="more-action album-section">
                                            <div className="album-label">Album</div>
                                            <AlbumSelector
                                                preselectOptions={imageAlbumMap[el.uuid] ?? []}
                                                callbackFn={selectedAlbums => {
                                                    assignImageToAlbums(el.uuid, selectedAlbums);
                                                }}
                                                dropUp
                                                ref={albumSelectorRef}
                                                allowMultiple
                                            />
                                        </div>
                                        <div className="divider" />
                                        <div
                                            className="more-action danger"
                                            onClick={(e) => { e.stopPropagation(); setFocusedImage(null); setMoreSettingsOpen(false); deleteImage(el.uuid) }}
                                        >
                                            <img src="/assets/delete.svg" /> Löschen
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )
                    })
                ) : (
                    <p>Keine Bilder vorhanden</p>
                )
            }
            </div>
        </div>
    )
}

export default ImageBrowser