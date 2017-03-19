// Initializing the scoped injector.
require('../../lib')(
  require('./config/project.tree')
);

// Requiring modules per scope.
const UserController = require('${controller}/user');

// Retrieving the `foo-interpolate` user.
const foo = new UserController().getUser('foo-interpolate');

// Logging the `foo-interpolate` user object.
console.log(`User foo-interpolate: ${JSON.stringify(foo)}`);
