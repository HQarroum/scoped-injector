const _      = require('lodash');
const path   = require('path');
let object   = undefined;

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
module.exports.register = (identifier, impl) => (object[identifier] = impl, object[identifier]);

/**
 * Unregisters an identifier using the
 * current strategy. This method might be
 * called by thrid-party plugins looking to
 * unregister identifiers.
 */
module.exports.unregister = (identifier, impl) => delete object[identifier];

/**
 * Loads the current strategy.
 */
module.exports.load = (opts, params) => {
  object = params.object;
  _.each(opts.tree, (value, key) => {
    params.object[key] = (pathname) =>
      loader(opts.project.base).load(value.path, pathname);
  });
};
