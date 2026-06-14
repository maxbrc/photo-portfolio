import { useState, useEffect, forwardRef, useImperativeHandle } from "react";

import { Album } from "../types/albums";

import "../styles/album_selector.css";

interface SelectedAlbum {
    id: number;
    name: string;
}

const AlbumSelector = forwardRef(({ callbackFn, preselectOptions, dropUp = false, allowMultiple = false }: { callbackFn: (selectedAlbum: number[]) => void; preselectOptions?: number[]; dropUp?: boolean; allowMultiple?: boolean; }, ref) => {
    const [ selectedAlbums, setSelectedAlbums ] = useState<number[]>([]);
    const [ albums, setAlbums ] = useState<Album[]>([]);
    const [ open, setOpen ] = useState(false);

    useImperativeHandle(ref, () => {
        return {
            close: () => setOpen(false),
            isOpen: open
        }
    }, [open])

    const fetchAlbums = async (): Promise<Album[]> => {
        const res = await fetch("/api/albums")
        const json: Album[] = await res.json()
        setAlbums(json)
        return json
    }

    const handleGlobalClick = () => {
        if (open) {
            setOpen(false)
        }
    }

    useEffect(() => {
        document.addEventListener("click", handleGlobalClick)
        return () => document.removeEventListener("click", handleGlobalClick)
    }, [open])

    useEffect(() => {
        const run = async () => {
            try {
                const albums = await fetchAlbums()

                if (preselectOptions) {
                    for (let albumID of preselectOptions) {
                        const foundAlbum = albums.find(el => el.id === albumID)

                        if (foundAlbum) {
                            setSelectedAlbums(currAlbums => {
                                if (currAlbums.includes(foundAlbum.id)) return currAlbums
                                return [...currAlbums, foundAlbum.id]
                            })
                        }
                    }
                }
            } catch (e) {
                console.error(e)
            }
        }
        
        run()
    }, [])

    const select = (album: number | null, e: React.MouseEvent) => {
        e.stopPropagation()

        let newSelectedAlbums: number[] = [];
        if (album === null) {
            if (selectedAlbums.length === 0) return
            newSelectedAlbums = [];
            setOpen(false)
        } else if (selectedAlbums.includes(album)) {
            if (!allowMultiple) return
            newSelectedAlbums = selectedAlbums.filter(al => al !== album)
        } else {
            if (!allowMultiple) {
                newSelectedAlbums = [album]
                setOpen(false)
            } else {
                newSelectedAlbums = [...selectedAlbums, album]
            }
        }

        setSelectedAlbums(newSelectedAlbums)
        callbackFn(newSelectedAlbums)
    }

    return (
        <div
            className={`album-selector ${open ? "open" : ""} ${dropUp ? "drop-up" : ""}`}
            onClick={(e) => { e.stopPropagation(); setOpen(v => !v) }}
        >
            <div className="trigger">
                <span className="trigger-label">
                    <img src="/assets/album.svg" />
                    {
                        selectedAlbums.length !== 0 ? (selectedAlbums.length === 1 ? albums.find(al => al.id === selectedAlbums[0])!.name : `${selectedAlbums.length} Alben ausgewählt`): "Nicht zugewiesen"
                    }
                </span>
                <img className="chevron" src="/assets/expand.svg" />
            </div>
            {open && (
                <ul className="dropdown">
                    <li
                        className={selectedAlbums.length === 0 ? "selected" : ""}
                        onClick={(e) => select(null, e)}
                    >
                        <img className="checkmark" src="/assets/check.svg" />
                        Nicht zugewiesen
                    </li>
                    {albums.map(el => (
                        <li
                            key={el.id}
                            className={selectedAlbums.includes(el.id) ? "selected" : ""}
                            onClick={(e) => {
                                select(el.id, e)
                            }}
                        >
                            <img className="checkmark" src="/assets/check.svg" />
                            {el.name}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    )
})

export default AlbumSelector