const _      = require('lodash');
const Module = require('module');

/**
 * Patches the `require` function and imports the given
 * function accessible through the name `key`.
 */
const patchRequire = (opts, path, key, f) => {
  // Saving the current wrap function.
  const wrapper = Module.wrap;
  // Overriding the wrap function.
  Module.wrap = function (content) {
    // Executing the current wrapper on the content.
    const value = wrapper(content);
    // Overriding the code which will be evaluated.
    let code = value.slice(0, value.lastIndexOf(content))
      + ` require.${key} = ${f.toString()}; `
      + value.slice(value.lastIndexOf(content));
    code = code.replace('opts.project.base', "'" + opts.project.base + "'")
               .replace('value.path', "'" + path + "'");
    return (code);
  };
};

module.exports.load = (opts, params) => {
  _.each(opts.tree, (value, key) => {
    const patch = (pathname) => {
      return require(require('path').join(opts.project.base, value.path, pathname));
    };
    // Loading the injectors into the global namespace.
    patchRequire(opts, value.path, key, patch);
    // Patching the module local `require` function.
    if (params && _.isFunction(params.require)) {
      params.require[key] = patch;
    }
  });
};
