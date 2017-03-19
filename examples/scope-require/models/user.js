class User {
  constructor(name) {
    this.name = name;
  }

  get name() {
    return (this._name);
  }

  set name(name) {
    this._name = name;
  }
}

module.exports = User;
