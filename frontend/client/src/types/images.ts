interface Image {
    uuid: string;
    landscape: boolean;
}

interface AlbumImage {
    uuid: string;
    landscape: boolean;
    rank: number;
}

export { Image, AlbumImage }