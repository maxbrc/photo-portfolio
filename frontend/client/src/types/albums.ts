interface Album {
    id: number;
    name: string;
    cover_image_uuid: string | null;
    rank: number;
}

interface FetchedAlbumImageAssignment {
    [key: string]: {
        [key: string]: number;
    }
}

interface AlbumImageAssignment {
    [key: number]: {
        [key: string]: number;
    }
}

export { Album, FetchedAlbumImageAssignment, AlbumImageAssignment }