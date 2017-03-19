// Initializing the scoped injector.
const $ = require.main.require('../../lib')(
  require.main.require('./config/project.tree')
);

// Retrieving the `User` model.
const User = $.model('user');

class UserController {
  getUser(name) {
    return new User(name);
  }
};

module.exports = UserController;
