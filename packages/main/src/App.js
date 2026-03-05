import React from "react";
import { HashRouter as Router, Link, useLocation } from "react-router-dom";
import { Routes } from "./routes";

const AppLayout = () => {
    const location = useLocation();
    const showHeader = location.pathname === "/";

    return (
        <div className="app-shell">
            {showHeader ? (
                <header className="app-header">
                    <div className="app-title">Toolbox</div>
                    <nav className="app-nav">
                        <Link to="/who-goes-first">Who Goes First</Link>
                        <Link to="/annual-report">Annual Report</Link>
                        <Link to="/zhihao-kitchen">Zhihao Kitchen</Link>
                        <Link to="/sharding">Sharding Helper</Link>
                        <Link to="/downloader">Downloader</Link>
                    </nav>
                </header>
            ) : null}
            <main className="app-main">
                <Routes/>
            </main>
        </div>
    );
};

function App() {
    return (
        <Router basename='/'>
            <AppLayout />
        </Router>
    );
}

export default App;
