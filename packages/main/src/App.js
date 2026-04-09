import React, { useState, useRef, useCallback, useEffect } from "react";
import { HashRouter as Router, Link, useLocation } from "react-router-dom";
import { Routes } from "./routes";
import { initGA, trackPageView } from "./ga";

const TOOL_ITEMS = [
    {
        path: "/game-analysis/entry",
        title: "狼人杀 · 记录",
        description: "记录每局游戏结果，管理玩家名单与历史数据。",
        tag: "游戏记录",
        accent: "#7c3aed",
        emoji: "🐺",
    },
    {
        path: "/game-analysis/analytics",
        title: "狼人杀 · 分析",
        description: "查看整体胜率、角色表现与玩家统计数据。",
        tag: "数据分析",
        accent: "#5b21b6",
        emoji: "📊",
    },
    {
        path: "/who-goes-first",
        title: "Who Goes First",
        description: "Break ties and pick the next driver, speaker, or owner in seconds.",
        tag: "Decision helper",
        accent: "#e76f37",
        emoji: "🎲",
    },
    {
        path: "/sharding",
        title: "Sharding Helper",
        description: "Calculate shard keys and split strategies without the guesswork.",
        tag: "Infra utility",
        accent: "#1f6e9b",
        emoji: "🔀",
    },
    {
        path: "/downloader",
        title: "Downloader",
        description: "Queue batch pulls and keep assets moving in the background.",
        tag: "Batch tool",
        accent: "#8a5cc7",
        emoji: "⬇️",
    },
    {
        path: "/sync-input",
        title: "Sync Input",
        description: "Paste once, retrieve anywhere. A shared notebook for quick text sync.",
        tag: "Sync notebook",
        accent: "#cf6d2a",
        emoji: "📋",
    },
    {
        path: "/video",
        title: "Video",
        description: "Your personal Netflix-style video library. Browse, search and watch your collection.",
        tag: "Video library",
        accent: "#c0392b",
        emoji: "🎬",
    },
];

const INTERNAL_ITEMS = [
    {
        path: "/annual-report",
        title: "Annual Report",
        description: "Assemble a clean narrative for yearly highlights and milestones.",
        tag: "Story builder",
        accent: "#2b8f7a",
        emoji: "📰",
    },
];

const ALL_ITEMS = [...TOOL_ITEMS, ...INTERNAL_ITEMS];

const DEFAULT_TITLE = "Toolbox";

function setEmojiFavicon(emoji) {
    const canvas = document.createElement("canvas");
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext("2d");
    ctx.font = "56px serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(emoji, 32, 36);

    let link = document.querySelector("link[rel~='icon']");
    if (!link) {
        link = document.createElement("link");
        link.rel = "icon";
        document.head.appendChild(link);
    }
    link.href = canvas.toDataURL("image/png");
}

function resetFavicon() {
    let link = document.querySelector("link[rel~='icon']");
    if (link) {
        link.href = "/favicon.ico";
    }
}

function useDocumentMeta(pathname) {
    useEffect(() => {
        const match = ALL_ITEMS.find((item) =>
            pathname === item.path || (item.path !== "/" && pathname.startsWith(item.path + "/"))
        );

        if (match) {
            document.title = `${match.title} — Toolbox`;
            setEmojiFavicon(match.emoji);
        } else {
            document.title = DEFAULT_TITLE;
            resetFavicon();
        }

        return () => {
            document.title = DEFAULT_TITLE;
            resetFavicon();
        };
    }, [pathname]);
}

const ToolIndex = () => {
    const [internalOpen, setInternalOpen] = useState(false);
    const contentRef = useRef(null);

    const toggle = useCallback(() => {
        setInternalOpen((prev) => !prev);
    }, []);

    return (
        <section className="tool-index">
            <div className="tool-hero">
                <div className="tool-hero__copy">
                    <span className="tool-hero__eyebrow">Tool collection</span>
                    <h1 className="tool-hero__title">Toolbox</h1>
                    <p className="tool-hero__lede">
                        Focused, single-purpose tools to move work forward without the noise.
                    </p>
                    <div className="tool-hero__meta">
                        <span className="tool-hero__count">{TOOL_ITEMS.length} tools</span>
                        <span className="tool-hero__divider" />
                        <span className="tool-hero__hint">Pick one to jump in.</span>
                    </div>
                </div>
            </div>

            <div className="tool-grid">
                {TOOL_ITEMS.map((tool, index) => (
                    <Link
                        key={tool.path}
                        to={tool.path}
                        className="tool-card"
                        style={{
                            "--card-accent": tool.accent,
                            "--card-index": index,
                        }}
                    >
                        <div className="tool-card__tag">{tool.tag}</div>
                        <h2 className="tool-card__title">{tool.title}</h2>
                        <p className="tool-card__desc">{tool.description}</p>
                        <div className="tool-card__cta">Open tool</div>
                    </Link>
                ))}
            </div>

            <div className={`tool-section-collapse ${internalOpen ? "tool-section-collapse--open" : ""}`}>
                <button
                    className="tool-section-collapse__summary"
                    onClick={toggle}
                    aria-expanded={internalOpen}
                >
                    <span className="tool-section-collapse__arrow">&#9654;</span>
                    <h2 className="tool-section-collapse__title">Hidden</h2>
                </button>
                <div
                    className="tool-section-collapse__body"
                    ref={contentRef}
                    style={{
                        maxHeight: internalOpen
                            ? `${contentRef.current?.scrollHeight || 0}px`
                            : "0px",
                    }}
                >
                    <p className="tool-section-collapse__desc">These tools are for internal use and testing purposes.</p>
                    <div className="tool-grid">
                        {INTERNAL_ITEMS.map((tool, index) => (
                            <Link
                                key={tool.path}
                                to={tool.path}
                                className="tool-card"
                                style={{
                                    "--card-accent": tool.accent,
                                    "--card-index": index,
                                }}
                            >
                                <div className="tool-card__tag">{tool.tag}</div>
                                <h2 className="tool-card__title">{tool.title}</h2>
                                <p className="tool-card__desc">{tool.description}</p>
                                <div className="tool-card__cta">Open tool</div>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>

            <div className="tool-index__footer">
                More utilities are on deck. Keep this tab handy for new drops.
            </div>
        </section>
    );
};

const AppLayout = () => {
    const location = useLocation();

    useEffect(() => {
        trackPageView(location.pathname);
    }, [location]);

    useDocumentMeta(location.pathname);
    const showTopBar = location.pathname !== "/" && !location.pathname.startsWith("/video");
    const showIndex = location.pathname === "/";
    const isVideo = location.pathname.startsWith("/video");

    const isGameAnalysis = location.pathname.startsWith("/game-analysis");

    return (
        <div className="app-shell">
            {showTopBar ? (
                <header className="app-topbar">
                    {isGameAnalysis ? (
                        <>
                            <span className="app-topbar__title" style={{ cursor: "default" }}>🐺 狼人杀大法官数据</span>
                            <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
                                <Link
                                    to="/game-analysis/entry"
                                    className="app-topbar__link"
                                    style={location.pathname === "/game-analysis/entry" ? { fontWeight: 600, opacity: 1 } : {}}
                                >
                                    记录
                                </Link>
                                <Link
                                    to="/game-analysis/analytics"
                                    className="app-topbar__link"
                                    style={location.pathname === "/game-analysis/analytics" ? { fontWeight: 600, opacity: 1 } : {}}
                                >
                                    分析
                                </Link>
                            </div>
                        </>
                    ) : (
                        <>
                            <Link to="/" className="app-topbar__title">Toolbox</Link>
                            <Link to="/" className="app-topbar__link">All tools</Link>
                        </>
                    )}
                </header>
            ) : null}
            <main className="app-main" style={isVideo ? { padding: 0 } : {}}>
                {showIndex ? <ToolIndex /> : null}
                <Routes />
            </main>
        </div>
    );
};

function App() {
    useEffect(() => {
        initGA();
    }, []);

    return (
        <Router basename="/">
            <AppLayout />
        </Router>
    );
}

export default App;
