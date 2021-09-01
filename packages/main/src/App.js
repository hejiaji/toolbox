import React from "react";
import { HashRouter as Router } from "react-router-dom";
import { Routes } from "./routes";

function App() {
    return (
        <Router basename='/'>
            <Routes/>
        </Router>
    );
}

export default App;
