const basscss = require('postcss-basscss')
const ExtractTextPlugin = require('extract-text-webpack-plugin');
let extractCSS = new ExtractTextPlugin('stylesheets/[name].css');

const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlWebpackPluginConfig = new HtmlWebpackPlugin({
  template: './src/index.html',
  filename: 'index.html',
  inject: 'body'
})
module.exports = { 
  entry: './src', 
  output: { 
    path: path.resolve('dist'), 
    filename: 'index_bundle.js'
  }, 
  module: { 
    loaders: [ 
      { 
        test: /\.js$/, 
        loader: 'babel-loader', 
        exclude: /node_modules/ 
      },
      {
        test: /\.scss$/,
        loader: extractCSS.extract(['css-loader', 'sass-loader'])
       
      }
    ]
  },

  resolve: {
    alias: {
     'crossfilter': 'crossfilter2'
    }
  },
  plugins: [HtmlWebpackPluginConfig, 
    extractCSS]
}