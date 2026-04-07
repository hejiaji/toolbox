import React, { useCallback, useEffect, useRef, useState } from "react";
import {
    fetchNote as sheetsFetchNote,
    pushNote as sheetsPushNote,
    deleteNote as sheetsDeleteNote,
} from "../data/sheetsApi";
import { isGoogleSheetsEnabled } from "../data/sheetsConfig";
import styled from "styled-components";
import {
    Button,
    Card,
    Divider,
    Input,
    Typography,
    Tag,
    message,
} from "antd";

const { Title, Paragraph, Text } = Typography;
const { TextArea } = Input;

const Page = styled.div`
    min-height: calc(100vh - 120px);
    background: radial-gradient(circle at top, #f6f1ea 0%, #f0ebe2 48%, #e6e1d9 100%);
    display: flex;
    justify-content: center;
    padding: 2.5rem 1.5rem 3.5rem;
`;

const Canvas = styled.div`
    width: 100%;
    max-width: 980px;
    display: flex;
    flex-direction: column;
    gap: 1.75rem;
`;

const Hero = styled.div`
    display: grid;
    gap: 0.75rem;
`;

const HeroEyebrow = styled.span`
    text-transform: uppercase;
    letter-spacing: 0.18em;
    font-weight: 600;
    font-size: 0.7rem;
    color: #6b5f56;
`;

const HeroTitle = styled(Title)`
    && {
        margin: 0;
        font-size: clamp(2rem, 3.2vw, 3rem);
        font-weight: 600;
    }
`;

const HeroCopy = styled(Paragraph)`
    && {
        margin: 0;
        color: #6b5f56;
        max-width: 520px;
    }
`;


const StyledCard = styled(Card)`
    && {
        border-radius: 22px;
        border: 1px solid rgba(60, 47, 39, 0.1);
        box-shadow: 0 18px 50px rgba(47, 32, 24, 0.12);
        background: rgba(255, 255, 255, 0.88);
        backdrop-filter: blur(6px);
    }
`;

const CardHeader = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
`;

const CardTitle = styled.div`
    font-size: 1.05rem;
    font-weight: 600;
    color: #2f241d;
`;

const StatusPill = styled(Tag)`
    && {
        border-radius: 999px;
        font-weight: 600;
        border: none;
        padding: 0.2rem 0.75rem;
    }
`;


const FooterRow = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 0.65rem;
    margin-top: 0.9rem;
`;

const FooterMeta = styled.div`
    font-size: 0.9rem;
    color: #6b5f56;
`;

const SyncRow = styled.div`
    display: flex;
    flex-direction: column;
    gap: 1rem;
`;

const SyncRowFooter = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
    flex-wrap: wrap;
`;

const NotePreview = styled.div`
    background: #1f1811;
    color: #f6f0e8;
    padding: 1.1rem 1.25rem;
    border-radius: 18px;
    font-family: "IBM Plex Mono", "SFMono-Regular", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas,
        "Liberation Mono", "Courier New", monospace;
    font-size: 0.95rem;
    min-height: 160px;
    white-space: pre-wrap;
`;

const PreviewRow = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.85rem;
`;

const STORAGE_KEY = "toolbox.syncInput";
const NOTE_ID = "default";
const POLL_INTERVAL_MS = 4000;

const loadStoredState = () => {
    if (typeof window === "undefined") {
        return null;
    }
    try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch (error) {
        return null;
    }
};

const saveStoredState = (state) => {
    if (typeof window === "undefined") {
        return;
    }
    try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
        // Ignore storage errors (quota, private mode)
    }
};

const fetchNote = async () => {
    if (!isGoogleSheetsEnabled()) {
        throw new Error("Google Sheets not configured");
    }
    return sheetsFetchNote(NOTE_ID);
};

const pushNote = async (noteValue) => {
    if (!isGoogleSheetsEnabled()) {
        throw new Error("Google Sheets not configured");
    }
    return sheetsPushNote(NOTE_ID, noteValue);
};

const formatNotePreview = (noteValue) => {
    if (!noteValue.trim()) {
        return "Paste a note on any device to see it here.";
    }
    return noteValue;
};

const copyNoteToClipboard = async (noteValue) => {
    const trimmedValue = noteValue.trim();
    if (!trimmedValue) {
        message.info("Nothing to copy yet.");
        return;
    }
    try {
        if (navigator?.clipboard?.writeText) {
            await navigator.clipboard.writeText(trimmedValue);
        } else {
            const textarea = document.createElement("textarea");
            textarea.value = trimmedValue;
            textarea.setAttribute("readonly", "");
            textarea.style.position = "absolute";
            textarea.style.left = "-9999px";
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand("copy");
            document.body.removeChild(textarea);
        }
        message.success("Copied to clipboard.");
    } catch (error) {
        message.error("Copy failed. Try selecting the text.");
    }
};

const SyncInput = () => {
    const [noteValue, setNoteValue] = useState("");
    const [lastSavedAt, setLastSavedAt] = useState(null);
    const [syncStatus, setSyncStatus] = useState("idle");
    // Track the last updatedAt we know about from the server so we can skip
    // no-op polls and avoid overwriting local edits.
    const lastServerUpdatedAt = useRef(null);
    // Guard to pause polling while a local push is in-flight or edits are pending.
    const isPushing = useRef(false);
    const hasPendingEdits = useRef(false);
    const isUserEdit = useRef(false);

    // -- Bootstrap: load from localStorage first (instant), then fetch remote --
    useEffect(() => {
        const stored = loadStoredState();
        if (typeof stored?.noteValue === "string") {
            setNoteValue(stored.noteValue);
        }
        if (stored?.lastSavedAt) {
            setLastSavedAt(stored.lastSavedAt);
        }

        // Fetch remote note on mount
        fetchNote()
            .then((remote) => {
                if (remote.updatedAt) {
                    lastServerUpdatedAt.current = remote.updatedAt;
                    lastKnownContent.current = remote.noteValue;
                    setNoteValue(remote.noteValue);
                    setLastSavedAt(remote.updatedAt);
                    saveStoredState({ noteValue: remote.noteValue, lastSavedAt: remote.updatedAt });
                }
                setSyncStatus("live");
            })
            .catch(() => {
                setSyncStatus("offline");
            });
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // -- Push local edits to server (debounced) --
    const pushToServer = useCallback(
        async (value) => {
            isPushing.current = true;
            setSyncStatus("syncing");
            try {
                const result = await pushNote(value);
                lastServerUpdatedAt.current = result.updatedAt;
                lastKnownContent.current = value;
                setLastSavedAt(result.updatedAt);
                saveStoredState({ noteValue: value, lastSavedAt: result.updatedAt });
                setSyncStatus("live");
            } catch {
                setSyncStatus("offline");
            } finally {
                isPushing.current = false;
            }
        },
        [],
    );

    useEffect(() => {
        if (!isUserEdit.current) return;
        hasPendingEdits.current = true;
        const timeoutId = setTimeout(() => {
            pushToServer(noteValue).then(() => {
                hasPendingEdits.current = false;
                isUserEdit.current = false;
            });
        }, 800);

        return () => clearTimeout(timeoutId);
    }, [noteValue, pushToServer]);

    // -- Poll server for remote changes --
    const lastKnownContent = useRef("");
    useEffect(() => {
        const intervalId = setInterval(async () => {
            if (isPushing.current || hasPendingEdits.current) {
                return;
            }
            try {
                const remote = await fetchNote();
                const remoteValue = remote.noteValue || "";
                if (remoteValue !== lastKnownContent.current) {
                    lastKnownContent.current = remoteValue;
                    lastServerUpdatedAt.current = remote.updatedAt;
                    setNoteValue(remoteValue);
                    setLastSavedAt(remote.updatedAt);
                    saveStoredState({ noteValue: remoteValue, lastSavedAt: remote.updatedAt });
                }
                setSyncStatus("live");
            } catch {
                setSyncStatus("offline");
            }
        }, POLL_INTERVAL_MS);

        return () => clearInterval(intervalId);
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const handleClear = async () => {
        setNoteValue("");
        saveStoredState({ noteValue: "", lastSavedAt: null });
        if (isGoogleSheetsEnabled()) {
            try {
                await sheetsDeleteNote(NOTE_ID);
            } catch {
                // ignore
            }
        }
        setLastSavedAt(null);
    };

    const statusConfig = {
        idle: { color: "default", label: "Idle" },
        syncing: { color: "processing", label: "Syncing" },
        live: { color: "success", label: "Live" },
        offline: { color: "warning", label: "Offline" },
    };
    const status = statusConfig[syncStatus] || statusConfig.idle;

    return (
        <Page>
            <Canvas>
                <Hero>
                    <HeroEyebrow>Sync notebook</HeroEyebrow>
                    <HeroTitle level={2}>Sync Input</HeroTitle>
                    <HeroCopy>
                        Paste a snippet on one device, pick it up on another. Your latest text stays ready
                        for a quick copy anywhere.
                    </HeroCopy>
                </Hero>

                <StyledCard>
                    <CardHeader>
                        <CardTitle>Live note</CardTitle>
                        <StatusPill color={status.color}>{status.label}</StatusPill>
                    </CardHeader>
                    <Divider />
                    <SyncRow>
                        <div>
                            <TextArea
                                value={noteValue}
                                onChange={(event) => { isUserEdit.current = true; setNoteValue(event.target.value); }}
                                placeholder="Paste or type here"
                                autoSize={{ minRows: 6, maxRows: 12 }}
                            />
                        </div>
                        <SyncRowFooter>
                            <Text type="secondary">
                                {syncStatus === "offline"
                                    ? (isGoogleSheetsEnabled()
                                        ? "Sheets unreachable - changes saved locally"
                                        : "Google Sheets not configured - local only")
                                    : "Auto-sync is on"}
                            </Text>
                            <Button
                                disabled={!noteValue}
                                onClick={handleClear}
                            >
                                Clear
                            </Button>
                        </SyncRowFooter>
                    </SyncRow>
                </StyledCard>

                <StyledCard>
                    <CardHeader>
                        <CardTitle>Preview</CardTitle>
                        <StatusPill color={status.color}>{status.label}</StatusPill>
                    </CardHeader>
                    <Divider />
                    <PreviewRow>
                        <NotePreview>{formatNotePreview(noteValue)}</NotePreview>
                        <FooterRow>
                            <FooterMeta>
                                {lastSavedAt
                                    ? `Saved ${new Date(lastSavedAt).toLocaleTimeString()}`
                                    : "Not saved yet"}
                            </FooterMeta>
                            <Button
                                type="primary"
                                disabled={!noteValue}
                                onClick={() => copyNoteToClipboard(noteValue)}
                            >
                                Copy text
                            </Button>
                        </FooterRow>
                    </PreviewRow>
                </StyledCard>
            </Canvas>
        </Page>
    );
};

export { SyncInput };
