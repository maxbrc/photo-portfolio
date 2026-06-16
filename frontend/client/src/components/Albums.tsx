import { useState, useEffect } from "react";
import { Link } from "react-router";

import { Album } from "../types/albums";

import "../styles/albums.css"

const toSlug = (name: string) => name.toLowerCase().replace(/\s+/g, '-')

function Albums() {
    const [ albums, setAlbums ] = useState<Album[]>([])

    useEffect(() => {
        fetch("/api/albums")
            .then(res => res.json())
            .then(json => setAlbums(json))
            .catch(e => console.error(e))
    }, [])

    return (
        <>
            <h1>Gallery</h1>
            <div className="albums-wrapper">
                <div className="albums">
                    {
                        albums.length > 0 ? (
                            albums.map(album => {
                                if (album.id === 0) return
                                return (
                                        <Link key={album.id} to={`/gallery/${toSlug(album.name)}`}><div><img src={`/photos/${album.cover_image_uuid}.webp?width=400&height=0`} alt="Albumcover" /><span>{album.name}</span></div></Link>
                                )
                            })
                        ) : (
                            <p>Keine Alben vorhanden</p>
                        )
                    }
                </div>
            </div>
        </>
    )
}

export default Albums