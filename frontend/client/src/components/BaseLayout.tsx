import { Outlet } from "react-router";

import Footer from "./Footer";
import Header from "./Header";

function BaseLayout() {
    return (
        <>
            <Header />
            <main>
                <Outlet />
            </main>
            <Footer />
        </>
    )
}

export default BaseLayout