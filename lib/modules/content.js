const path = require('path');
const _    = require('lodash');
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

module.exports.load = (options) => {

    /**
     * Creating the global content utility.
     */
    global['$content'] = contentReader(options.project.base);

     _.each(options.tree, (value, key) => {
        // Assigning the get utility to each defined tree child.
        global['$content'][key] = (pathname, callback) => {
            return global['$content'].get(path.join(value.path, pathname), callback);
        };
    });
};
