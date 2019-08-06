const webpack = require('webpack');
const useSourceMap = process.env.GENERATE_SOURCEMAPS && process.env.GENERATE_SOURCEMAPS === "true";

module.exports = {
  devtool: useSourceMap ? 'source-map' : false,
  entry: {
    app: ['babel-polyfill', './index'],
    vendor: [
      'babel-polyfill',
      'react',
      'react-redux',
      'react-router',
      'react-router-redux',
      'moment',
      'leaflet',
    ],
  },
  output: {
    path: __dirname + '/public/',
    filename: 'bundle.js',
    publicPath: './public/',
    sourceMapFilename: '[name].bundle.[chunkhash].js.map',
  },
  plugins: [
    new webpack.optimize.CommonsChunkPlugin({
      name: 'vendor',
      filename: 'vendor.bundle.js',
    }),
    new webpack.DefinePlugin({
      'process.env': {
        'NODE_ENV': JSON.stringify('production'),
        'BABEL_ENV': JSON.stringify('production'),
        'VERSION': JSON.stringify(require('./package.json').version),
        'THEME': JSON.stringify(process.env.THEME),
        'AUTH_SERVER_URL': JSON.stringify(process.env.AUTH_SERVER_URL),
        'TIAMAT_BASE_URL': JSON.stringify(process.env.TIAMAT_BASE_URL), // Marduk
        'ENDPOINTBASE': JSON.stringify(process.env.ABZU_ENDPOINT_BASE) // Abzu base url
      },
    }),
    new webpack.optimize.AggressiveMergingPlugin({ minSizeReduce: 1.2 }),
    new webpack.optimize.UglifyJsPlugin({
      minimize: true,
      beautify: false,
      comments: false,
      compress: {
        warnings: false,
        screw_ie8: true,
      },
      sourceMap: !!useSourceMap
    }),
    new webpack.optimize.ModuleConcatenationPlugin()
  ],
  module: {
    loaders: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        include: __dirname,
        loader: 'babel-loader',
        query: {
          presets: ['es2015', 'stage-1', 'react'],
        },
      },
      {
        test: /\.css$/,
        exclude: /node_modules/,
        include: __dirname,
        loaders: ['style-loader', 'css-loader'],
      },
      {
        test: /\.(jpe?g|png|gif|svg)$/i,
        exclude: /node_modules/,
        loaders: [
          'file-loader?hash=sha512&digest=hex&name=[hash].[ext]'
        ],
      },
    ],
  },
};


