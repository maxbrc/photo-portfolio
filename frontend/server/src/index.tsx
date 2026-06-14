import express from "express";
import { StaticRouter } from "react-router";
import { renderToString } from "react-dom/server";
import path from "path";

import App from "../../client/src/components/App";

const app = express()

app.use("/static", express.static(path.join(process.cwd(), "client/dist/static/")))
app.use("/assets", express.static(path.join(process.cwd(), "client/dist/assets/")))

app.get("/{*any}", (req, res) => {
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
        <meta name="description" content="Fotografieportfolio von Richard Freier">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link rel="canonical" href="https://richard-freier.com/">
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Italiana&family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap" rel="stylesheet">
        <link rel="stylesheet" href="/static/main.css">
        <link rel="icon" type="image/x-icon" href="/assets/favicon.png" />
        <title>Richard Freier Fotografie</title>
    </head>
    <body>
        <div id="root">${html}</div>
        <script src="/static/index_bundle.js"></script>
    </body>
    </html>    
    `)
})

app.listen(3010, () => console.log("Node listening on 3010..."))