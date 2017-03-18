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

module.exports.load = (options) => {

  /**
   * Creating the global path utility used to build
   * the absolute path of a module.
   */
  global['$path'] = pathMaker(options.project.base);

   _.each(options.tree, (value, key) => {
      // Assigning the get utility to each defined tree child.
      global['$path'][key] = (pathname) => {
          return global['$path'].get(path.join(value.path, pathname));
      };
  });
};
