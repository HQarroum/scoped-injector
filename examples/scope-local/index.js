// Initializing the scoped injector.
const $ = require.main.require('../../lib')(
  require.main.require('./config/project.tree')
);

// Requiring modules per scope.
const UserController = $.controller('user');

// Retrieving the `foo-local` user.
const foo = new UserController().getUser('foo-local');

// Logging the `foo-local` user object.
console.log(`User foo-local: ${JSON.stringify(foo)}`);
