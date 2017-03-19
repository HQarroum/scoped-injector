const tree = require('./config/project.tree');

// We want to patch the local `require` function as well.
tree.strategy.parameters = {
  require: require
};

// Initializing the scoped injector.
require('../../lib')(tree);

// Requiring modules per scope.
const UserController = require.controller('user');

// Retrieving the `foo-require` user.
const foo = new UserController().getUser('foo-require');

// Logging the `foo-require` user object.
console.log(`User foo-require: ${JSON.stringify(foo)}`);
