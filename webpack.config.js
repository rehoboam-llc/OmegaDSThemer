const path = require('path');
const webpack = require('webpack');
const Dotenv = require('dotenv-webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = (env, argv) => ({
    mode: argv.mode === 'production' ? 'production' : 'development',

    // This is necessary because Figma's 'eval' works differently than normal eval
    devtool: argv.mode === 'production' ? false : 'inline-source-map',
    watch: true,
    entry: {
        code: './src/code.ts' // This is the entry point for our plugin code.
    },
    module: {
        rules: [
            // Converts TypeScript code to JavaScript
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
        ],
    },
    // Webpack tries these extensions for you if you omit the extension like "import './file'"
    resolve: {
        extensions: ['.ts', '.js'],
        fallback: {
            "crypto": false,
            "buffer": require.resolve("buffer")
        }
    },
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, 'dist'),
    },

    devServer: {
        watchFiles: ["*.html"],
        hot: true,
    },

    plugins: [
      new Dotenv()
    ],
});