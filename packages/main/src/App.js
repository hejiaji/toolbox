import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import {Routes} from "./routes";

function App() {
    return (
        <Router>
            <Routes />
            <div className="App">
                Hello World
            </div>
        </Router>
    );
}

export default App;
