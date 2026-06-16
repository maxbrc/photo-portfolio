import { useParams, Link } from "react-router";
import { useState, useEffect } from "react";

import { Album } from "../types/albums";
import { AlbumImage } from "../types/images";

import NotFound from "./NotFound";

import "../styles/gallery.css"

const toSlug = (name: string) => name.toLowerCase().replace(/\s+/g, '-')

interface Dimensions {
    width: number;
    height: number;
}

function Gallery() {
    const [ albums, setAlbums ] = useState<Album[]>([])
    const [ images, setImages ] = useState<AlbumImage[]>([])
    const [ ready, setReady ] = useState(false)
    const [ albumsFetched, setAlbumsFetched ] = useState(false)
    const [ modal, setModal ] = useState<AlbumImage | null>(null)
    const [ portraitDimensions, setPortraitDimensions ] = useState<Dimensions | null>(null)
    const [ landscapeDimensions, setLandscapeDimensions ] = useState<Dimensions | null>(null)
    const [ modalPortraitDimensions, setModalPortraitDimensions ] = useState<Dimensions | null>(null)
    const [ modalLandscapeDimensions, setModalLandscapeDimensions ] = useState<Dimensions | null>(null)
    const [ readyToLoad, setReadyToLoad ] = useState(false)
    const [ readyToLoadModalPortrait, setReadyToLoadModalPortrait ] = useState(false)
    const [ readyToLoadModalLandscape, setReadyToLoadModalLandscape ] = useState(false)
    const [ mounted, setMounted ] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const fetchAlbums = async () => {
        const res = await fetch("/api/albums")
        const json = await res.json()
        setAlbums(json)
    }

    const fetchImages = async (albumID: number) => {
        const res = await fetch(`/api/images/${albumID}`)
        const json = await res.json()
        setImages(json)
    }

    const { albumName } = useParams();

    useEffect(() => {
        fetchAlbums()
        .then(() => {setReady(true); setAlbumsFetched(true)})
        .catch(e => console.error(e))
    }, [])

    useEffect(() => {
        if (!albumsFetched || !albumName) {
            return
        }
        const album = albums.find(el => toSlug(el.name) === albumName)
        if (album) {
            fetchImages(album.id).catch(e => console.error(e))
        }
    }, [albumsFetched, albumName])

    useEffect(() => {
        document.documentElement.style.overflow = modal == null ? "auto" : "hidden"
        return () => { document.documentElement.style.overflow = "auto" }
    }, [modal])

    if (!albumName) {
        return <NotFound />
    }

    if (ready) {
        if (!albums.some(el => toSlug(el.name) === albumName)) {
            return <NotFound />
        }
    }

    const currentAlbumName = albums.find(el => toSlug(el.name) === albumName)?.name ?? ''

    useEffect(() => {
        if (portraitDimensions !== null && landscapeDimensions !== null) {
            setReadyToLoad(true)
        }
    }, [portraitDimensions, landscapeDimensions])

    return (
        <>
            <Link to="/gallery" className="back-btn">← Gallery</Link>
            <h1>Gallery<br/><span className="red">{currentAlbumName}</span></h1>
            <div className="gallery">
                <div
                    className={modal!=null ? "backdrop active" : "backdrop"}
                    onClick={() => setModal(null)}
                >
                    <img
                        className="close-icon"
                        src="/assets/close.svg"
                    />
                    {modal !== null && <img
                        src={
                            `/photos/${modal.uuid}.webp` +
                            (
                                modal.landscape
                                ? readyToLoadModalLandscape
                                    ? `?width=${modalLandscapeDimensions!.width}&height=${modalLandscapeDimensions!.height}`
                                    : `?width=${landscapeDimensions!.width}&height=${landscapeDimensions!.height}`
                                : readyToLoadModalPortrait
                                    ? `?width=${modalPortraitDimensions!.width}&height=${modalPortraitDimensions!.height}`
                                    : `?width=${portraitDimensions!.width}&height=${portraitDimensions!.height}`
                            )
                        }
                        alt="Bild aus der Galerie in Großansicht"
                        onLoad={
                            e => {
                                if (modal.landscape) {
                                    if (modalLandscapeDimensions === null) {
                                        const dpr = window.devicePixelRatio || 1;
                                        const { height, width } = e.currentTarget.getBoundingClientRect();
                                        const roundedHeight = Math.ceil(height * dpr / 200) * 200
                                        const roundedWidth = Math.ceil(width * dpr / 200) * 200
                                        setModalLandscapeDimensions({ height: roundedHeight, width: roundedWidth })
                                        setReadyToLoadModalLandscape(true)
                                    }
                                } else  {
                                    if (modalPortraitDimensions === null) {
                                        const dpr = window.devicePixelRatio || 1;
                                        const { height, width } = e.currentTarget.getBoundingClientRect();
                                        const roundedHeight = Math.ceil(height * dpr / 200) * 200
                                        const roundedWidth = Math.ceil(width * dpr / 200) * 200
                                        setModalPortraitDimensions({ height: roundedHeight, width: roundedWidth })
                                        setReadyToLoadModalPortrait(true)
                                    }
                                }
                            }
                        }
                        onClick={(e: React.MouseEvent) => e.stopPropagation()}
                        className={modal.landscape ? "wide": ""}
                    />}
                </div>
                {
                    !readyToLoad && mounted &&
                    <>
                        <img
                            src="/assets/black.svg"
                            onLoad={
                                e => {
                                    const dpr = window.devicePixelRatio || 1;
                                    const { height, width } = e.currentTarget.getBoundingClientRect();
                                    const roundedHeight = Math.ceil(height * dpr / 200) * 200
                                    const roundedWidth = Math.ceil(width * dpr / 200) * 200
                                    setPortraitDimensions({ height: roundedHeight, width: roundedWidth })
                                }
                            }
                        />
                        <img
                            src="/assets/black.svg"
                            onLoad={
                                e => {
                                    const dpr = window.devicePixelRatio || 1;
                                    const { height, width } = e.currentTarget.getBoundingClientRect();
                                    const roundedHeight = Math.ceil(height * dpr / 200) * 200
                                    const roundedWidth = Math.ceil(width * dpr / 200) * 200
                                    setLandscapeDimensions({ height: roundedHeight, width: roundedWidth })
                                }
                            }
                            className="wide"
                        />
                    </>
                }
                { readyToLoad &&
                    images.length > 0 ? (
                        images.map(img => {
                            return (
                                    <img
                                        key={img.uuid}
                                        onClick={() => setModal(img)}
                                        className={img.landscape ? "wide": ""}
                                        src={
                                            "/photos/" + img.uuid + ".webp" + (img.landscape ? `?width=${landscapeDimensions!.width}&height=${landscapeDimensions!.height}` : `?width=${portraitDimensions!.width}&height=${portraitDimensions!.height}`)
                                        }
                                        alt="Bild aus der Galerie"
                                        loading="lazy"
                                    />
                            )
                        })
                    ) : (
                        <p>Keine Bilder vorhanden</p>
                    )
                }
            </div>
        </>
    )
}

export default Gallery