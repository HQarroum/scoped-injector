const _    = require('lodash');
const path = require('path');
const tree = require('./config/project.tree');

class CustomStrategy {

  /**
   * A simple helper to load a module which
   * is located in `base`.
   */
  loader(base) {
    return {
      load: (pathname, name) => require(path.join(base, pathname, name))
    };
  }

  /**
   * Registers a new identifier using the
   * current strategy. This method might be
   * called by third-party plugins looking to
   * register new identifiers.
   */
  register(identifier, impl) {
    global.customRequire[identifier] = impl;
  }

  /**
   * Unregisters an identifier using the
   * current strategy. This method might be
   * called by third-party plugins looking to
   * unregister identifiers.
   */
  unregister(identifier, impl) {
    delete global.customRequire[identifier];
  }

  /**
   * Loads the current strategy.
   */
  load(options, params) {
    console.log(`Loading CustomStrategy with parameters ${JSON.stringify(params)}`);
    global.customRequire = (pathname) => this.loader(options.project.base).load('', pathname);
    _.each(options.tree, (value, key) => {
      // Loading the injectors into the global namespace.
      global.customRequire[key] = (pathname) => this.loader(options.project.base).load(value.path, pathname);
    });
  }
};

// We want to patch the local `require` function as well.
tree.strategy = {
  impl: new CustomStrategy(),
  parameters: {
    foo: 'bar'
  }
};

// Initializing the scoped injector.
require('../../lib')(tree);

// Requiring modules per scope.
const UserController = customRequire.controller('user');

// Retrieving the `foo-strategy` user.
const foo = new UserController().getUser('foo-strategy');

// Logging the `foo-strategy` user object.
console.log(`User foo-strategy: ${JSON.stringify(foo)}`);
