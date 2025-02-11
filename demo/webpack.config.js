const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = {
    entry: './src/libs.js',
    output: {
        filename: 'index.js',
        path: path.resolve(__dirname, 'libs'),
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env']
                    }
                }
            }
        ]
    },
    performance: {
        hints: 'warning'
    },
    optimization: {
        minimize: false
    },
    plugins: [
        // clean out ./demo/libs/ before building
        new CleanWebpackPlugin(),
    ]
};
