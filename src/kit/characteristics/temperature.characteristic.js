const { request } = require('../../services/sinope.gateway');
const R = require('ramda');

function pickCharacteristic(Characteristic, loginPromise) {

  const features = [
    {
      uuid: (new Characteristic.CurrentTemperature()).UUID,
      set: setTemperature,
      get: getTemperature,
    },
    {
      uuid: (new Characteristic.TargetTemperature()).UUID,
      set: setTargetTemperature,
      get: getTargetTemperature,
    },
    {
      uuid: (new Characteristic.CurrentHeatingCoolingState()).UUID,
      get: getHeatingState,
    },
    {
      uuid: (new Characteristic.TargetHeatingCoolingState()).UUID,
      get: getTargetHeatingCoolingState,
      set: setTargetHeatingCoolingState,
    },
    {
      uuid: (new Characteristic.TemperatureDisplayUnits()).UUID,
      get: getTemperatureDisplayUnits,
      set: setTemperatureDisplayUnits,
    }
  ];

  return (characteristic, homebridgeAccessory) => {
    const uuid = 'uuid';
    const extractEvent = R.compose(R.dissoc(uuid),
                                   R.find(R.propEq(uuid, characteristic.UUID)));
     R.map(action => {
          characteristic.on(action, callback => {
            const event = extractEvent(features);
            event[action](callback, homebridgeAccessory, loginPromise);
          });
    }, R.keys(event));
  }
}

function getDevice(deviceId, loginPromise) {
  loginPromise
  .then(authData => {
    const { session } = authData;
    return request({
      method: 'GET',
      path: ['device', deviceId, 'data'],
      sessionId: session,
    })
    .then(device => {
      console.log(device);
      return device;
    })
  });
}

function getTemperature(callback, { id }, loginPromise) {
  getDevice(id, loginPromise)
  .then(device => {
    callback(undefined, Math.round(device.temperature));
  });
}

function setTemperature(callback, homebridgeAccessory, loginPromise) {
  callback(undefined, 10.0);
}

function setTargetTemperature(callback, homebridgeAccessory, loginPromise) {
  //Characteristic.CurrentHeatingCoolingState.HEAT = 1;
  callback(undefined, 12.0);
}

function getTargetTemperature(callback, homebridgeAccessory, loginPromise) {
  getDevice(id, loginPromise)
  .then(device => {
    callback(undefined, Math.round(device.setpoint));
  });
}

function getHeatingState(callback, homebridgeAccessory, loginPromise) {
  //Characteristic.CurrentHeatingCoolingState.HEAT = 1;
  callback(undefined, 1)
}

function getTargetHeatingCoolingState(callback, homebridgeAccessory, loginPromise) {
  callback(undefined, 1);
/*
Characteristic.TargetHeatingCoolingState.OFF = 0;
Characteristic.TargetHeatingCoolingState.HEAT = 1;
Characteristic.TargetHeatingCoolingState.COOL = 2; // not supported
Characteristic.TargetHeatingCoolingState.AUTO = 3; no supported
*/
}

function setTargetHeatingCoolingState(callback, homebridgeAccessory, loginPromise) {
  callback(undefined, 1);
}

function getTemperatureDisplayUnits(callback, homebridgeAccessory, loginPromise) {
 callback(undefined, 0);
}

function setTemperatureDisplayUnits(callback, homebridgeAccessory, loginPromise) {
  callback(undefined, 1);
}

module.exports = {
  pickCharacteristic,
}
