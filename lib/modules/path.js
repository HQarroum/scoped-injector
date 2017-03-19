const path = require('path');
const _    = require('lodash');

/**
 * Returns an array of keys forbidden
 * by the current module.
 */
module.exports.forbiddenKeys = () => {
  return ['path'];
};

/**
 * @return the `path` identifier methods associated
 * with the paths in the project tree.
 */
const describeIdentifiers = (opts) => {
  const object = {
    get: (pathname) => {
      return path.join(opts.project.base, pathname);
    }
  };
  _.each(opts.tree, (value, key) => {
    object[key] = (pathname) => object.get(path.join(value.path, pathname));
  });
  return (object);
};

/**
 * Loads the `path` plugin.
 */
module.exports.load = (opts) => {
  opts.strategiesImpl.forEach((strategy) => {
    strategy.register('path', describeIdentifiers(opts));
  });
};
