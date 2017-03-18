const _    = require('lodash');
const path = require('path');

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

module.exports.load = (options, params) => {
  const prefix = (params && params.prefix) || '$';
  _.each(options.tree, (value, key) => {
    // Loading the injectors into the global namespace.
    global[prefix + key] = (pathname) => loader(options.project.base).load(value.path, pathname);
  });
};
