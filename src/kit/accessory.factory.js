const R = require('ramda');
const { request } = require('../services/sinope.gateway');

function accessories(log, accessoryMaker, loginPromise) {
  return (homeBridgeCallback) => {

    loginPromise.then(authData => {
      session = authData.session
      request({
        method: 'GET',
        path: ['locations'],
        sessionId: session,
      })
      .then(location => {
        const extractLocationId = R.pipe(R.head, R.prop('id')); const
        queryString = {'location$id': extractLocationId(location)};
        return request({
          method: 'GET',
          path: ['devices'],
          sessionId: session,
          queryString,
        });
      })
      .then(devices => {
        // Gateways are now returned in the list of devices so we need to
        // filter these out. 
        const thermostats = devices.filter(function(device) {
        // TODO(palourde): There must be a more reliable way of doing this than
        // relying on the parentDevice$id field
          return device['parentDevice$id'] !== null;
        });

        R.call(homeBridgeCallback, R.map(accessoryMaker, thermostats));
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
      const services = [ platform.getInformationService(homebridgeAccessory) ];
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
