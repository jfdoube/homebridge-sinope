const R = require('ramda');
const { request } = require('../services/sinope.gateway');

function accessories(log, accessoryMaker, loginPromise) {
  return (homeBridgeCallback) => {

    loginPromise.then(authData => {
      const { session } = authData;
      request({
        method: 'GET',
        path: ['gateway'],
        sessionId: session,
      })
      .then(gateway => {
        const extractGatewayId = R.pipe(R.head, R.prop('id'));
        const queryString = {
          gatewayId: extractGatewayId(gateway),
        };

        return request({
          method: 'GET',
          path: ['device'],
          sessionId: session,
          queryString,
        });
      })
      .then(devices => {
        R.call(homeBridgeCallback, R.map(accessoryMaker, devices));
      });
    });
  }
}

function getInformationService({ Name, Manufacturer, Model, SerialNumber }, Service) {
  return ({ name, manufacturer, model, serialNumber }) => {
    const informationService = new Service.AccessoryInformation();
    const setCharacteristic = (key, value) => {
      return informationService.setCharacteristic(key, value);
    };
    R.zipWith(setCharacteristic,
              [Name, Manufacturer, Model, SerialNumber],
              [name, manufacturer, model, serialNumber]);
    return informationService;
  }
}

function getServices(log, pickCharacteristic) {

  return homebridgeAccessory => {
      const { platform } = homebridgeAccessory;
      const services = [platform.getInformationService(homebridgeAccessory)];
      R.forEach(service => {
        const { controlService } = service;
        services.push(controlService);
        R.forEach(serviceCharacterics => {
          const characteristic = controlService.getCharacteristic(serviceCharacterics);
          if (characteristic == undefined)
              characteristic = controlService.addCharacteristic(serviceCharacterics);
          pickCharacteristic(characteristic, homebridgeAccessory);
        }, service.characteristics);
      }, homebridgeAccessory.services);
      return services;
  };
}

function identify(log) {
  return (callback) => {
    log('Identifying');
    callback();
  }
}

module.exports = {
  accessories,
  getServices,
  getInformationService,
  identify,
}
