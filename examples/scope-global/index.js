// Initializing the scoped injector.
require('../../lib')(
  require('./config/project.tree')
);

// Requiring modules per scope.
const UserController = $controller('user');

// Retrieving the `foo-global` user.
const foo = new UserController().getUser('foo-global');

// Logging the `foo-global` user object.
console.log(`User foo-global: ${JSON.stringify(foo)}`);
