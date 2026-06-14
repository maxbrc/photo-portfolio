import path from "path";
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import CopyPlugin from "copy-webpack-plugin";
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
    
const __dirname = dirname(fileURLToPath(import.meta.url));

const config = {
    entry: "./client/src/components/index.tsx",
    output: {
        filename: "index_bundle.js",
        path: path.join(__dirname, "dist/static"),
        publicPath: "/static/"
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: ["ts-loader"]
            },
            {
                test: /\.css$/,
                use: [MiniCssExtractPlugin.loader, "css-loader"]
            },
        ]
    },
    resolve: {
        extensions: [".tsx", ".ts", ".jsx", ".js"]
    },
    plugins: [new MiniCssExtractPlugin(),
        new CopyPlugin({
            patterns: [
                { from: path.join(__dirname, "src/assets"), to: "../assets" },
            ],
        })
    ]
}

export default config