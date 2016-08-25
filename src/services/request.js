const R = require('ramda');
const request = require('request-promise');
const winston = require('winston');

const METHOD_MAP = {
  'GET': request.get,
  'POST': request.post,
  'PUT': request.put,
};

const DEFAULTS = {
  headers: {
    'Accept': 'application/json',
  },
  json: true,
};

function httpAction(method, url, options) {
  if (!R.has(method, METHOD_MAP)) {
    throw new Error('Unsupported HTTP method.');
  }

  winston.info(`Outgoing ${method} ${url}`);

  const httpMethod = METHOD_MAP[method];
  const payload = R.mergeAll([
    DEFAULTS,
    options,
    {
      method,
      uri: url,
    },
  ]);
  return httpMethod(payload);
}

function sessionOption(sessionId) {
  return (method, url, options) => {
    const headerOptions = {
      headers: {
        'Session-Id': sessionId,
      },
    };

    const mergedOptions = R.merge(headerOptions, options);
    return httpAction(method, url, mergedOptions);
  };
}

module.exports = {
  sessionOption,
  httpAction,
};
