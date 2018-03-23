const {createServer} = require('https');

const env = require('@shopify/slate-env');

const Compiler = require('./compiler');
const App = require('./app');
const Server = require('./server');
const ssl = require('./ssl');

module.exports = class DevServer {
  constructor(config) {
    this.isFirstDeploy = true;
    this.app = new App();
    this.server = createServer(ssl(), this.app);
    this.server.listen(config.port);
  }
};
