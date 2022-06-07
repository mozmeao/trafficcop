const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const package = require('./package.json');
const version = package.version;

module.exports = {
    entry: './src/mozilla-traffic-cop.js',
    output: {
        filename: 'index.js',
        path: path.resolve(__dirname, 'dist'),
        library: {
            name: 'trafficcop',
            type: 'umd'
        }
    },
    performance: {
        hints: 'warning'
    },
    optimization: {
        minimize: false
    },
    plugins: [
        // clean out dist/ before building
        new CleanWebpackPlugin(),
        new CopyPlugin({
            patterns: [
                {
                    from: path.resolve(__dirname, 'src/package/package.json'),
                    transform: function (content) {
                        return JSON.stringify(
                            JSON.parse(content, (k, v) =>
                                k === 'version' ? version : v
                            ),
                            null,
                            4
                        );
                    }
                },
                {
                    from: path.resolve(__dirname, 'README.md')
                },
                {
                    from: path.resolve(__dirname, 'LICENSE')
                }
            ]
        })
    ]
};
