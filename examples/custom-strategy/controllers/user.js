// Retrieving the `User` model.
const User = customRequire.model('user');

class UserController {
  getUser(name) {
    return new User(name);
  }
};

module.exports = UserController;
