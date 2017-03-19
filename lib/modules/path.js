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
 * A simple helper to retrieve the absolute
 * path of a directory.
 */
const pathMaker = (base) => {
  return {
    get: (pathname) => {
      return path.join(base, pathname);
    }
  };
};

/**
 * Loads the `path` plugin.
 */
module.exports.load = (opts) => {
  opts.strategiesImpl.forEach((strategy) => {
    const o = strategy.register('path', pathMaker(opts.project.base));
    if (o) {
      _.each(opts.tree, (value, key) => {
        o[key] = (pathname) => o.get(path.join(value.path, pathname));
      });
    }
  });
};
