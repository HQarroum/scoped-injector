const _      = require('lodash');
const Module = require('module');
let req;

/**
 * Patches the `require` function and imports the given
 * function accessible through the name `key`.
 */
const patchRequire = (identifier, impl, interceptor) => {
  // Saving the current wrap function.
  const wrapper = Module.wrap;
  // Overriding the wrap function.
  Module.wrap = function (content) {
    // Executing the current wrapper on the content.
    const value = wrapper(content);
    // Overriding the code which will be evaluated.
    let code = value.slice(0, value.lastIndexOf(content))
      + ` require.${identifier} = ${_.isFunction(impl) ? impl.toString() : JSON.stringify(impl)}; `
      + value.slice(value.lastIndexOf(content));
    return (interceptor ? interceptor(code) : code);
  };
};

/**
 * Registers a new identifier using the
 * current strategy. This method might be
 * called by third-party plugins looking to
 * register new identifiers.
 */
module.exports.register = (identifier, impl) => {
  patchRequire(identifier, impl);
  if (req) {
    req[identifier] = impl;
  }
};

/**
 * Unregisters an identifier using the
 * current strategy. This method might be
 * called by third-party plugins looking to
 * unregister identifiers.
 */
module.exports.unregister = (identifier, impl) => {
  // Not supported.
};

/**
 * Loads the current strategy.
 */
module.exports.load = (opts, params) => {
  _.each(opts.tree, (value, key) => {
    const patch = (pathname) => require(require('path').join(opts.project.base, value.path, pathname));
    // Checking whether the given identifier conflict with an existing one.
    if (require[key]) {
      throw new Error(`The identifier '${key}' already exists in require`);
    }
    // Loading the injectors into the global namespace.
    patchRequire(key, patch, (code) =>
      code.replace('opts.project.base', "'" + opts.project.base + "'")
          .replace('value.path', "'" + value.path + "'")
    );
    // Patching the module local `require` function.
    if (params && _.isFunction(params.require)) {
      params.require[key] = patch;
      req = params.require;
    }
  });
};
