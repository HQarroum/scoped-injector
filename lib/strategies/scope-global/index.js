const _    = require('lodash');
const path = require('path');
let prefix = '$';

/**
 * A simple helper to load a module which
 * is located in `base`.
 */
const loader = (base) => {
  return {
    load: function (pathname, name) {
      return require(path.join(base, pathname, name));
    }
  };
};

/**
 * Registers a new identifier using the
 * current strategy. This method might be
 * called by thrid-party plugins looking to
 * register new identifiers.
 */
module.exports.register = (identifier, impl) => global[prefix + identifier] = impl;

/**
 * Unregisters an identifier using the
 * current strategy. This method might be
 * called by thrid-party plugins looking to
 * unregister identifiers.
 */
module.exports.unregister = (identifier, impl) => delete global[prefix + identifier];

/**
 * Loads the current strategy.
 */
module.exports.load = (options, params) => {
  prefix = (params && params.prefix) || '$';
  _.each(options.tree, (value, key) => {
    // Loading the injectors into the global namespace.
    global[prefix + key] = (pathname) => loader(options.project.base).load(value.path, pathname);
  });
};
