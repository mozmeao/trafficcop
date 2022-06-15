const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = {
    entry: './src/libs.js',
    output: {
        filename: 'index.js',
        path: path.resolve(__dirname, 'libs/')
    },
    performance: {
        hints: 'warning'
    },
    optimization: {
        minimize: false
    },
    plugins: [
        // clean out demo/libs/ before building
        new CleanWebpackPlugin()
    ]
};
