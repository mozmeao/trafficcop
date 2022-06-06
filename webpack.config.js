const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
    entry: {
        index: './src/mozilla-traffic-cop.js',
        'index.min': './src/mozilla-traffic-cop.js'
    },
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, 'dist'),
        clean: true
    },
    performance: {
        hints: 'warning'
    },
    optimization: {
        minimize: true,
        minimizer: [
            new TerserPlugin({
                parallel: true,
                include: /\.min\.js$/,
                extractComments: false
            })
        ]
    }
};
