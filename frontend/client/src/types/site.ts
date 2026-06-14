interface SiteContent {
    website: {
        title: string;
        description: string;
        url: string;
    };
    hero: {
        title: string
        subtitle: string
        image_uuid: string | null
    };
    socials: {
        type: "instagram" | "email"
        entries: {
            handle: string
            url: string
        }[]
    }[];
    equipment: string[];
    about: {
        text: string;
        image_uuid: string | null;
    };
    impressum: string;
}

export { SiteContent }