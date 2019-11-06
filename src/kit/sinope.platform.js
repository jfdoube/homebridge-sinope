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
  session = ''

  // Logout from neviweb on shutdown
  process.on('SIGINT', () => { logout()})
  process.on('SIGTERM', () => { logout() })

  return function(log, { username, password }) {
    const loginPromise = request({
      method: 'POST',
      path: ['login'],
      body: { username, password, interface: 'neviweb', stayConnected: 1 },
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
    const {
      CurrentHeatingCoolingState,
      TargetHeatingCoolingState,
      CurrentTemperature,
      TargetTemperature,
      TemperatureDisplayUnits
    } = Characteristics;
    const model = [{
        controlService: new Service.Thermostat(device.name),
        characteristics: [
                    CurrentHeatingCoolingState,
                    TargetHeatingCoolingState,
                    CurrentTemperature,
                    TargetTemperature,
                    TemperatureDisplayUnits
                ]
    }];

    const accessory = new SinopeThermostatAccessory(log, model);
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

function logout() {
  request({
    method: 'GET',
    path: ['logout'],
    sessionId: session,
  })
  .then(response => {
    if (response.success === true) {
      console.log('successfully logged out')
      return
    }
  })
  .catch(err => {
    console.error('could not log out: ' + err)
  })
}

module.exports = sinopePlatform;
