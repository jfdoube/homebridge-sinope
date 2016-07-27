const sinopePlatform = require('./kit/sinope.platform');

module.exports = function (homebridge) {
  homebridge.registerPlatform("homebridge-sinope", "Sinope", sinopePlatform(homebridge));
};