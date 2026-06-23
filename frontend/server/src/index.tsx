import express from "express";
import { StaticRouter } from "react-router";
import { renderToString } from "react-dom/server";
import path from "path";
import fs from "fs";

import App from "../../client/src/components/App";

const app = express()

app.use("/static", express.static(path.join(process.cwd(), "client/dist/static/")))
app.use("/assets", express.static(path.join(process.cwd(), "client/dist/assets/")))
const publicPath = path.join(process.cwd(), "public");

fs.mkdirSync(publicPath);

app.get("/sitemap.xml", (req, res) => {
    res.sendFile(path.join(publicPath, "sitemap.xml"));
});

app.get("/robots.txt", (req, res) => {
    res.sendFile(path.join(publicPath, "robots.txt"));
});

interface websiteConfig {
    title: string;
    description: string;
    url: string;
}

app.get("/{*any}", async (req, res) => {
    let config: websiteConfig = {} as websiteConfig

    try {
        const res = await fetch(`${req.protocol}://${req.host}/api/site-content`)

        if (!res.ok) throw new Error(await res.text())

        const json: { website: websiteConfig } = await res.json();

        config = json.website
    } catch (e) {
        console.log("[ERROR] Failed to fetch website configuration: " + String(e))
        res.sendStatus(500)
        return
    }

    const html = renderToString(
        <StaticRouter location={req.url}>
            <App />
        </StaticRouter>
    )

    res.send(`
    <!DOCTYPE html>
    <html lang="de">
    <head>
        <meta charset="UTF-8">
        <meta name="description" content="${config.description}">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link rel="canonical" href="${config.url}">
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Italiana&family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap" rel="stylesheet">
        <link rel="stylesheet" href="/static/main.css">
        <link rel="icon" type="image/x-icon" href="/assets/favicon.png" />
        <title>${config.title}</title>
    </head>
    <body>
        <div id="root">${html}</div>
        <script src="/static/index_bundle.js"></script>
    </body>
    </html>    
    `)
})

app.listen(3010, () => console.log("[INFO] Node listening on 3010..."))