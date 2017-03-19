const _      = require('lodash');
const Module = require('module');
const path   = require('path');

/**
 * Registers a new identifier using the
 * current strategy. This method might be
 * called by third-party plugins looking to
 * register new identifiers.
 */
module.exports.register = (identifier, impl) => {
  // Not supported.
};

/**
 * Unregisters an identifier using the
 * current strategy. This method might be
 * called by third-party plugins looking to
 * unregister identifiers.
 */
module.exports.unregister = (identifier, impl) => {
  // Not supported.
};

/**
 * Interpolates a string with the keys associated
 * with the `o` object.
 */
const interpolate = (o) => {
	return function (string) {
  	return string.replace(/\${([^{}]*)}/g,
        function (a, b) {
            var r = o[b];
            return typeof r === 'string' || typeof r === 'number' ? r : a;
        }
    );
  };
};

/**
 * @return an object containing key/value pairs suited
 * to interpolate the string given to `require`.
 */
const getInterpolationObject = (opts) => {
  const obj = {};

  _.each(opts.tree, (value, key) => {
    obj[key] = path.join(opts.project.base, value.path);
  });
  return (obj);
};

/**
 * Loads the current strategy.
 */
module.exports.load = (opts, params) => {
  const original = Module.prototype.require;
  Module.prototype.require = function () {
    arguments[0] = interpolate(getInterpolationObject(opts))(arguments[0]);
    return original.apply(this, arguments);
  };
};
