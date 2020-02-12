const path = require("path");
module.exports = {
    entry: "./src/app.js",
    target: "node",
    output: {
        path: path.resolve(__dirname, "dist"),
        filename: "app.output.js"
    },
    module: {
        rules: [{ test: /\.js$/, exclude: /node_modules/, loader: "babel-loader" }]
    }
};