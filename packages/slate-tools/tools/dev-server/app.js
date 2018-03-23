const webpackDevMiddleware = require('webpack-dev-middleware');
const webpackHotMiddleware = require('webpack-hot-middleware');
const express = require('express');

module.exports = class App {
  constructor() {
    const app = express();

    app.compiler = new Compiler(config);
    app.webpackHotMiddleware = webpackHotMiddleware(compiler);

    app.use(app.webpackHotMiddleware);
    app.use(_setHeaderMiddleware);
    app.use(
      webpackDevMiddleware(compiler, {
        quiet: true,
        reload: false,
      }),
    );

    return app;
  }

  _setHeaderMiddleware(req, res, next) {
    res.set('Access-Control-Allow-Origin', '*');
    next();
  }
};
