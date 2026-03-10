import React from "react";
import { HashRouter as Router, Link, useLocation } from "react-router-dom";
import { Routes } from "./routes";

const TOOL_ITEMS = [
    {
        path: "/who-goes-first",
        title: "Who Goes First",
        description: "Break ties and pick the next driver, speaker, or owner in seconds.",
        tag: "Decision helper",
        accent: "#e76f37",
    },
    {
        path: "/annual-report",
        title: "Annual Report",
        description: "Assemble a clean narrative for yearly highlights and milestones.",
        tag: "Story builder",
        accent: "#2b8f7a",
    },
    {
        path: "/zhihao-kitchen",
        title: "Zhihao Kitchen",
        description: "Plan meals, track prep, and keep kitchen rhythms in sync.",
        tag: "Kitchen ops",
        accent: "#d69a2b",
    },
    {
        path: "/sharding",
        title: "Sharding Helper",
        description: "Calculate shard keys and split strategies without the guesswork.",
        tag: "Infra utility",
        accent: "#1f6e9b",
    },
    {
        path: "/downloader",
        title: "Downloader",
        description: "Queue batch pulls and keep assets moving in the background.",
        tag: "Batch tool",
        accent: "#8a5cc7",
    },
    {
        path: "/sync-input",
        title: "Sync Input",
        description: "Paste once, retrieve anywhere. A shared notebook for quick text sync.",
        tag: "Sync notebook",
        accent: "#cf6d2a",
    },
];

const ToolIndex = () => {
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

            <div className="tool-index__footer">
                More utilities are on deck. Keep this tab handy for new drops.
            </div>
        </section>
    );
};

const AppLayout = () => {
    const location = useLocation();
    const showTopBar = location.pathname !== "/";
    const showIndex = location.pathname === "/";

    return (
        <div className="app-shell">
            {showTopBar ? (
                <header className="app-topbar">
                    <Link to="/" className="app-topbar__title">Toolbox</Link>
                    <Link to="/" className="app-topbar__link">All tools</Link>
                </header>
            ) : null}
            <main className="app-main">
                {showIndex ? <ToolIndex /> : null}
                <Routes />
            </main>
        </div>
    );
};

function App() {
    return (
        <Router basename="/">
            <AppLayout />
        </Router>
    );
}

export default App;
