const {
  accessories,
  getInformationService,
  getServices,
  identify,
} = require('./accessory.factory.js');
const { pickCharacteristic } = require('./characteristics/temperature.characteristic.js');
const { request } = require('../services/sinope.gateway');

function sinopePlatform(homebridge) {
  const { Service, Characteristic } = homebridge.hap;

  return function(log, { username, password }) {

    const loginPromise = request({
      method: 'POST',
      path: ['login'],
      body: { email : username, password },
    });

    const services = getServices(log, pickCharacteristic(Characteristic, loginPromise));
    this.getInformationService = getInformationService(Characteristic, Service);
    this.getServices = services;
    this.identify = identify(log);
    this.accessories = accessories(log,
                      makeAccessory(log, Characteristic, Service, services, this),
                      loginPromise);
  };
}

function makeAccessory(log, Characteristics, Service, services, platform) {
  return device => {
    var model = [{
        controlService: new Service.Thermostat(device.name),
        characteristics: [
                    Characteristics.CurrentHeatingCoolingState,
                    Characteristics.TargetHeatingCoolingState,
                    Characteristics.CurrentTemperature,
                    Characteristics.TargetTemperature,
                    Characteristics.TemperatureDisplayUnits
                ]
    }];

    var accessory = new SinopeThermostatAccessory(log, model);
    accessory.getServices = () => {
      return services(accessory);
    };

    accessory.platform = platform;
    accessory.remoteAccessory	= device;
    accessory.id = device.id;
    accessory.name = device.name;
    accessory.model = `${device.model}`;
    accessory.manufacturer = 'Sinope technologies';
    accessory.serialNumber = device.mac;
    return accessory;
  }
}

function SinopeThermostatAccessory(log, services) {
    this.log = log;
    this.services = services;
}

module.exports = sinopePlatform;
