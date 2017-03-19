const _    = require('lodash');
const path = require('path');
const fs   = require('fs');

/**
 * Returns an array of keys forbidden
 * by the current module.
 */
module.exports.forbiddenKeys = () => {
  return ['content'];
};

/**
 * A simple helper that reads the content
 * of a module.
 */
const contentReader = (base) => {
  return {
    get: (pathname, callback) => {
      fs.readFile(path.join(base, pathname), 'utf-8', callback);
    }
  };
};

/**
 * Loads the `content` plugin.
 */
module.exports.load = (opts) => {
  opts.strategiesImpl.forEach((strategy) => {
    const o = strategy.register('content', contentReader(opts.project.base));
    if (o) {
      _.each(opts.tree, (value, key) => {
        o[key] = (pathname, callback) => o.get(path.join(value.path, pathname), callback);
      });
    }
  });
};
