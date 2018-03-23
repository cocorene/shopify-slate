const env = require('@shopify/slate-env');

const DevServer = require('../../tools/dev-server');
const config = require('../../slate-tools.config');

const previewUrl = `https://${env.getStoreValue()}?preview_theme_id=${env.getThemeIdValue()}`;

const devServer = new DevServer(config);
