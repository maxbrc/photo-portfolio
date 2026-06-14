import { merge } from "webpack-merge";
import commonConfig from "./webpack.common.js";

const config = merge(commonConfig, {
    mode: "production"
})

export default config