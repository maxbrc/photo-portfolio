import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { IconX, IconPlus, IconCheck, IconPhoto, IconPencil, IconUserCircle } from "@tabler/icons-react";

import ImageBrowser from "./ImageBrowser";
import MessageList from "./MessageList";

import { SiteContent } from "../types/site";
import { Image } from "../types/images";
import { MessageBadge, MessageBadgeTypes } from "../types/messages";

import "../styles/admin_albums.css";
import "../styles/admin_homepage.css";

function AdminHomepage({ validateSession, messages, createMessage }: {
    validateSession: () => Promise<string | null>;
    messages: MessageBadge[];
    createMessage: (type: MessageBadgeTypes, message: string, replaceIdentical?: boolean) => void;
    accessToken: string | null;
}) {
    const navigate = useNavigate();
    const [content, setContent] = useState<SiteContent | null>(null);
    const [imagePicker, setImagePicker] = useState<'hero' | 'about' | null>(null);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetch("/api/site-content")
            .then(res => res.json())
            .then((json: SiteContent) => setContent(json))
            .catch(e => createMessage(MessageBadgeTypes.ERROR, String(e)));
    }, []);

    const save = async () => {
        if (!content) return;
        const token = await validateSession();
        if (!token) return;
        setSaving(true);
        const res = await fetch("/api/site-content", {
            method: "PATCH",
            headers: { "Authorization": "Bearer " + token, "Content-Type": "application/json" },
            body: JSON.stringify(content),
        });
        setSaving(false);
        if (res.ok) {
            createMessage(MessageBadgeTypes.SUCCESS, "Homepage gespeichert");
        } else {
            createMessage(MessageBadgeTypes.ERROR, "Fehler: " + await res.text());
        }
    };

    const updateEquipment = (i: number, val: string) =>
        setContent(c => {
            if (!c) return null;
            const eq = [...c.equipment];
            eq[i] = val;
            return { ...c, equipment: eq };
        });

    const removeEquipment = (i: number) =>
        setContent(c => c ? { ...c, equipment: c.equipment.filter((_, j) => j !== i) } : null);

    const addEquipment = () =>
        setContent(c => c ? { ...c, equipment: [...c.equipment, ""] } : null);

    const updateSocialEntry = (si: number, ei: number, changes: Partial<{ handle: string; url: string }>) =>
        setContent(c => {
            if (!c) return null;
            return {
                ...c,
                socials: c.socials.map((s, sx) =>
                    sx !== si ? s : {
                        ...s,
                        entries: s.entries.map((e, ex) => ex !== ei ? e : { ...e, ...changes })
                    }
                )
            };
        });

    const removeSocialEntry = (si: number, ei: number) =>
        setContent(c => {
            if (!c) return null;
            return {
                ...c,
                socials: c.socials.map((s, sx) =>
                    sx !== si ? s : { ...s, entries: s.entries.filter((_, ex) => ex !== ei) }
                )
            };
        });

    const addSocialEntry = (si: number) => {
        if (!content) return;
        const newEntry = content.socials[si].type === "email"
            ? { handle: "", url: "mailto:" }
            : { handle: "", url: "" };
        setContent(c => {
            if (!c) return null;
            return {
                ...c,
                socials: c.socials.map((s, sx) =>
                    sx !== si ? s : { ...s, entries: [...s.entries, newEntry] }
                )
            };
        });
    };

    if (!content) return <div className="hp-loading">Lädt…</div>;

    return (
        <>
            <MessageList messages={messages} />
            <div className="admin-homepage">
                <div className="albums-top" style={{ marginBottom: 0 }}>
                    <img
                        src="/assets/home.svg"
                        className="albums-home-icon"
                        onClick={() => navigate("/admin/dashboard")}
                    />
                    <div className="albums-top-divider" />
                    <span className="albums-title">Bearbeitung Homepage</span>
                    <button className="hp-save-btn" onClick={save} disabled={saving}>
                        <IconCheck size={14} stroke={1.5} />
                        {saving ? "Speichert…" : "Speichern"}
                    </button>
                </div>   
                <div className="hp-section">
                    <div className="hp-section-label">Hero</div>
                    <div className="hp-hero-layout">
                        <div className="hp-hero-img-col">
                            <span className="albums-flabel">Hintergrundbild</span>
                            <div
                                className="albums-cover-preview hp-hero-preview"
                                onClick={() => setImagePicker('hero')}
                            >
                                {content.hero.image_uuid
                                    ? <img src={`/photos/${content.hero.image_uuid}.webp?width=300&height=0`} />
                                    : <IconPhoto size={24} stroke={1} />
                                }
                                <div className="albums-sel-overlay">
                                    <IconPencil size={13} stroke={1.5} /> Ändern
                                </div>
                            </div>
                        </div>
                        <div className="hp-hero-fields">
                            <div className="albums-field">
                                <span className="albums-flabel">Titel</span>
                                <input
                                    className="albums-finput"
                                    value={content.hero.title}
                                    onChange={e => setContent(c => c ? { ...c, hero: { ...c.hero, title: e.target.value } } : null)}
                                />
                            </div>
                            <div className="albums-field">
                                <span className="albums-flabel">Untertitel</span>
                                <input
                                    className="albums-finput"
                                    value={content.hero.subtitle}
                                    onChange={e => setContent(c => c ? { ...c, hero: { ...c.hero, subtitle: e.target.value } } : null)}
                                />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="hp-section">
                    <div className="hp-section-label">Über mich</div>
                    <div className="hp-hero-layout">
                        <div className="hp-hero-img-col">
                            <span className="albums-flabel">Profilbild</span>
                            <div
                                className="albums-cover-preview hp-about-preview"
                                onClick={() => setImagePicker('about')}
                            >
                                {content.about.image_uuid
                                    ? <img src={`/photos/${content.about.image_uuid}.webp?width=200&height=0`} />
                                    : <IconUserCircle size={28} stroke={0.8} />
                                }
                                <div className="albums-sel-overlay">
                                    <IconPencil size={13} stroke={1.5} /> Ändern
                                </div>
                            </div>
                        </div>
                        <div className="hp-hero-fields">
                            <textarea
                                className="albums-finput hp-textarea"
                                value={content.about.text}
                                rows={6}
                                onChange={e => setContent(c => c ? { ...c, about: { ...c.about, text: e.target.value } } : null)}
                            />
                        </div>
                    </div>
                </div>
                <div className="hp-section">
                    <div className="hp-section-label">Equipment</div>
                    <div className="hp-list">
                        {content.equipment.map((item, i) => (
                            <div key={i} className="hp-list-row">
                                <input
                                    className="albums-finput hp-list-input"
                                    value={item}
                                    placeholder="Gerät / Objektiv"
                                    onChange={e => updateEquipment(i, e.target.value)}
                                />
                                <button className="hp-list-remove" onClick={() => removeEquipment(i)}>
                                    <IconX size={13} stroke={1.5} />
                                </button>
                            </div>
                        ))}
                        <button className="albums-new-btn hp-add-btn" onClick={addEquipment}>
                            <IconPlus size={14} stroke={1.5} /> Item hinzufügen
                        </button>
                    </div>
                </div>
                <div className="hp-section">
                    <div className="hp-section-label">Socials</div>
                    <div className="hp-socials">
                        {content.socials.map((social, si) => (
                            <div key={si} className="hp-social-group">
                                <div className="hp-social-type-label">
                                    {social.type === "instagram" ? "Instagram" : "E-Mail"}
                                </div>
                                <div className="hp-social-entries">
                                    {social.entries.map((entry, ei) => (
                                        <div key={ei} className="hp-list-row">
                                            <input
                                                className="albums-finput hp-list-input"
                                                value={entry.handle}
                                                placeholder={social.type === "email" ? "E-Mail Adresse" : "Handle"}
                                                onChange={e => {
                                                    const val = e.target.value;
                                                    updateSocialEntry(si, ei,
                                                        social.type === "email"
                                                            ? { handle: val, url: `mailto:${val}` }
                                                            : { handle: val }
                                                    );
                                                }}
                                            />
                                            {social.type === "instagram" && (
                                                <input
                                                    className="albums-finput hp-list-input"
                                                    value={entry.url}
                                                    placeholder="https://instagram.com/…"
                                                    onChange={e => updateSocialEntry(si, ei, { url: e.target.value })}
                                                />
                                            )}
                                            {social.type === "email" && (
                                                <div className="hp-url-badge" title={`mailto:${entry.handle}`}>
                                                    mailto:{entry.handle}
                                                </div>
                                            )}
                                            <button className="hp-list-remove" onClick={() => removeSocialEntry(si, ei)}>
                                                <IconX size={13} stroke={1.5} />
                                            </button>
                                        </div>
                                    ))}
                                    <button className="albums-new-btn hp-add-btn" onClick={() => addSocialEntry(si)}>
                                        <IconPlus size={14} stroke={1.5} /> Eintrag hinzufügen
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="hp-section">
                    <div className="hp-section-label">Website</div>
                    <div className="hp-hero-fields">
                        <div className="albums-field">
                            <span className="albums-flabel">Titel</span>
                            <input
                                className="albums-finput"
                                value={content.website.title}
                                onChange={e => setContent(c => c ? { ...c, website: { ...c.website, title: e.target.value } } : null)}
                            />
                        </div>
                        <div className="albums-field">
                            <span className="albums-flabel">Beschreibung</span>
                            <input
                                className="albums-finput"
                                value={content.website.description}
                                onChange={e => setContent(c => c ? { ...c, website: { ...c.website, description: e.target.value } } : null)}
                            />
                        </div>
                        <div className="albums-field">
                            <span className="albums-flabel">Basis URL (!)</span>
                            <input
                                className="albums-finput"
                                value={content.website.url}
                                placeholder={window !== undefined ? `${window.location.protocol}//${window.location.host}` : ""}
                                onChange={e => setContent(c => c ? { ...c, website: { ...c.website, url: e.target.value } } : null)}
                            />
                        </div>
                    </div>
                    <span className="albums-flabel"><br/>Vorsicht: Diese Werte nicht zu oft ändern! Sie sind essentiell für das Google Listing.</span>
                </div>
                <div className="hp-section">
                    <div className="hp-section-label">Impressum</div>
                    <textarea
                        className="albums-finput hp-textarea hp-textarea-tall"
                        value={content.impressum}
                        rows={14}
                        onChange={e => setContent(c => c ? { ...c, impressum: e.target.value } : null)}
                    />
                </div>

            </div>
            {imagePicker !== null && (
                <div className="dropdown-image-browser" onClick={() => setImagePicker(null)}>
                    <div onClick={e => e.stopPropagation()}>
                        <div className="dropdown-image-browser-x" onClick={() => setImagePicker(null)}>
                            <IconX size={18} stroke={1.5} />
                        </div>
                        <ImageBrowser
                            validateSession={validateSession}
                            createMessage={createMessage}
                            selectOnly
                            selectedImageCallbackFn={(image: Image) => {
                                if (imagePicker === 'hero') {
                                    setContent(c => c ? { ...c, hero: { ...c.hero, image_uuid: image.uuid } } : null);
                                } else {
                                    setContent(c => c ? { ...c, about: { ...c.about, image_uuid: image.uuid } } : null);
                                }
                                setImagePicker(null);
                            }}
                        />
                    </div>
                </div>
            )}
        </>
    );
}

export default AdminHomepage;
