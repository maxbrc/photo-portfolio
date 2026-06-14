import { Routes, Route } from "react-router";

import BaseLayout from "./BaseLayout";

import "../styles/app.css"
import Home from "./Home";
import Impressum from "./Impressum";
import Albums from "./Albums";
import Gallery from "./Gallery";
import Admin from "./Admin";

function App() {
    return (
        <Routes>
            <Route element={<BaseLayout />}>
                <Route path="/" element={<Home />} />
                <Route path="/gallery" element={<Albums />} />
                <Route path="/impressum" element={<Impressum />} />
                <Route path="/gallery/:albumName" element={<Gallery />} />
            </Route>
            <Route path="/admin/*" element={<Admin />} />
        </Routes>
    )
}

export default App