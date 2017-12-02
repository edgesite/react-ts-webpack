import * as webpack from 'webpack';
import * as HtmlWebpackPlugin from 'html-webpack-plugin';
import * as path from 'path';

const isProd = process.env.NODE_ENV === 'production'

const config: webpack.Configuration = {
  devtool: 'source-map',
  entry: {
    vendor: ['react', 'react-dom', 'react-router', 'react-router-dom'],
    app: ['./src/index.tsx'],
  },
  output: {
    path: path.join(__dirname, 'dist'),
    pathinfo: false,
    filename: '[name].[hash:7].js',
    chunkFilename: '[name].[chunkhash:7].js',
    publicPath: '/',
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
  },
  resolveLoader: {
  },
  watchOptions: {
    ignored: /node_modules|dist/,
  },
  module: {
    rules: [
      {
        test: /\.json$/,
        loader: 'json-loader',
      },
      {
        test: /\.tsx?$/,
        loader: 'awesome-typescript-loader',
        options: {
          // useBabel: true,
        },
      },
      {
        test: /\.(ttf|woff2?|svg|png|jpe?g|gif)$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
        },
      },
      // {
      //   test: /\.(ttf|woff2?|svg|png|jpe?g|gif)$/,
      //   loader: 'file-loader',
      //   options: {
      //     name: '[name].[hash:7].[ext]',
      //   },
      // }
    ],
  },
  plugins: [
    new webpack.optimize.ModuleConcatenationPlugin(),
    new webpack.optimize.AggressiveMergingPlugin(),
    new webpack.optimize.CommonsChunkPlugin({
      name: 'vendor',
      filename: '[name].[hash:7].js',
    }),
    new webpack.NamedModulesPlugin(),
    new webpack.DefinePlugin({
      'process.env': {
        'NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
      },
    }),
    new HtmlWebpackPlugin({
      template: path.join(__dirname, 'src/index.html'),
      filename: path.join(__dirname, 'dist/index.html'),
      chunks: ['vendor', 'app'],
      chunksSortMode: 'dependency',
      minify: isProd ? {
        removeComments: true,
        useShortDoctype: true,
        collapseWhitespace: true,
        collapseInlineTagWhitespace: true,
        sortAttributes: true,
        sortClassName: true,
        minifyCSS: true,
        minifyJS: (source: string) => {
          return source ?
            require('google-closure-compiler-js').compile({jsCode: [{src: source}]}).compiledCode :
            '';
        },
      } as any : undefined,
    }),
  ],
  devServer: {
    hot: true,
    historyApiFallback: true,
  },
  performance: {
    hints: false,
  },
};

if (isProd) {
  const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
  const ClosureCompilerPlugin = require('webpack-closure-compiler');
  const CopyWebpackPlugin = require('copy-webpack-plugin');
  const ExtractTextPlugin = require('extract-text-webpack-plugin');
  const OptimizeCssPlugin = require('optimize-css-assets-webpack-plugin');

  const module: any = config.module;
  const extractor = new ExtractTextPlugin({
    filename: 'style.css',
    allChunks: true, 
  });
  module.rules = [
    {
      test: /\.css?$/,
      use: extractor.extract({
        fallback: 'style-loader',
        use: [
          {loader: 'css-loader', options: {importLoaders: 1}},
          {loader: 'postcss-loader'},
        ],
      }),
    },
    ...module.rules,
  ];
  config.plugins = [
    ...config.plugins!,
    new webpack.HashedModuleIdsPlugin(),
    new OptimizeCssPlugin(),
    extractor,
    new webpack.LoaderOptionsPlugin({
      minimize: true
    }),
    new ClosureCompilerPlugin({
      compiler: {
        charset: 'utf-8',
        create_source_map: true,
        language_in: 'ECMASCRIPT5_STRICT',
        language_out: 'ECMASCRIPT5_STRICT',
      },
    }),
    new BundleAnalyzerPlugin({
      analyzerMode: 'disabled',
      generateStatsFile: true,
      statsFilename: 'stats.json',
    }),
    new CopyWebpackPlugin([
      {
        from: path.join(__dirname, 'static'),
        to: path.join(__dirname, 'dist'),
        ignore: ['.*'],
      },
    ]),
  ];
} else {
  const entry: any = config.entry;
  const module: any = config.module;
  module.rules = [
    {
      test: /\.css?$/,
      use: [
        {loader: 'style-loader'},
        {loader: 'css-loader', options: {importLoaders: 1}},
        {loader: 'postcss-loader'},
      ],
    },
    ...module.rules,
  ];
  config.plugins = [
    ...config.plugins,
    new webpack.HotModuleReplacementPlugin(),
  ];
  if (entry instanceof Object) {
    Object.keys(entry).filter(key => key !== 'vendor').forEach(key => {
      entry[key] = ['react-hot-loader/patch', ...entry[key]];
    });
  }
}

export default config;
