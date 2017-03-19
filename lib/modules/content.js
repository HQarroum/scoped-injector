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
const contentReader = (opts) => {
  const object = {
    get: (pathname, callback) => {
      fs.readFile(path.join(opts.project.base, pathname), 'utf-8', callback);
    }
  };
  _.each(opts.tree, (value, key) => {
    object[key] = (pathname, callback) => object.get(path.join(value.path, pathname), callback);
  });
  return (object);
};

/**
 * Loads the `content` plugin.
 */
module.exports.load = (opts) => {
  opts.strategiesImpl.forEach((strategy) => {
    strategy.register('content', contentReader(opts));
  });
};
