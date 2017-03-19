// Retrieving the `User` model.
const User = require('${model}/user');

class UserController {
  getUser(name) {
    return new User(name);
  }
};

module.exports = UserController;
