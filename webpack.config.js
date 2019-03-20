// Look in ./micon-app/config folder for webpack.dev.js
switch (process.env.NODE_ENV) {
  case 'prod':
  case 'production':
    module.exports = require('./micon-app/config/webpack.prod');
    break;
  case 'dev':
  case 'development':
  default:
    module.exports = require('./micon-app/config/webpack.dev');
}
