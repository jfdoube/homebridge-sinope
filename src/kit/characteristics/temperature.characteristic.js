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
    const get = 'get';
    const set = 'set';
    const hasSetEvent = R.has(set);
    const hasGetEvent = R.has(get);
    const extractEvent = R.compose(R.dissoc(uuid),
                                   R.find(R.propEq(uuid, characteristic.UUID)));
    const event = extractEvent(features);
    if(hasSetEvent(event)) {
      characteristic.on(set, (value, callback) => {
        event[set](value, callback, homebridgeAccessory, loginPromise);
      });
    }
    if(hasGetEvent(event)) {
      characteristic.on(get, callback => {
        event[get](callback, homebridgeAccessory, loginPromise);
      });
    }
  }
}

function getDevice(homebridgeAccessory, loginPromise) {
  return loginPromise
  .then(authData => {
    const { session } = authData;
    queryString = {'attributes': 'setpointMode,roomSetpoint,roomSetpointMin,roomSetpointMax,roomTemperature,outputPercentDisplay,alarmsActive0'};

    return request({
      method: 'GET',
      path: ['device', homebridgeAccessory.id, 'attribute'],
      sessionId: session,
      queryString
    })
    .then(device => {
      return device;
    })
  });
}

function getTemperature(callback, homebridgeAccessory, loginPromise) {
  getDevice(homebridgeAccessory, loginPromise)
  .then(device => {
    callback(undefined, Math.round(device.roomTemperature.value));
  });
}

function setTemperature(value, callback, homebridgeAccessory, loginPromise) {
  callback(undefined, 10.0);
}

function setTargetTemperature(value, callback, homebridgeAccessory, loginPromise) {
  //Characteristic.CurrentHeatingCoolingState.HEAT = 1;
  const body = {
    roomSetpoint: value,
  };

  loginPromise
  .then(authData => {
    request({
      method: 'PUT',
      path: ['device', homebridgeAccessory.id, 'attribute'],
      sessionId: authData.session,
      body,
    })
    .then(res => {
      callback(undefined, value);
    })
  });
}

function getTargetTemperature(callback, homebridgeAccessory, loginPromise) {
  getDevice(homebridgeAccessory, loginPromise)
  .then(device => {
    callback(undefined, Math.round(device.roomSetpoint));
  });
}

function getHeatingState(callback, { id }, loginPromise) {
  //Characteristic.CurrentHeatingCoolingState.HEAT = 1;
  callback(undefined, 1)
}

function getTargetHeatingCoolingState(callback, { id }, loginPromise) {
  callback(undefined, 1);
/*
Characteristic.TargetHeatingCoolingState.OFF = 0;
Characteristic.TargetHeatingCoolingState.HEAT = 1;
Characteristic.TargetHeatingCoolingState.COOL = 2; // not supported
Characteristic.TargetHeatingCoolingState.AUTO = 3; no supported
*/
}

function setTargetHeatingCoolingState(value, callback, { id }, loginPromise) {
  callback(null, 1);
}

function getTemperatureDisplayUnits(callback, { id }, loginPromise) {
 callback(undefined, 0);
}

function setTemperatureDisplayUnits(value, callback, { id }, loginPromise) {
  callback(undefined, 1);
}

module.exports = {
  pickCharacteristic,
}
