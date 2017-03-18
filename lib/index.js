/**
 * The `scoped-injector` is constituted of a small set of helpers
 * built on top of `require` that allows to load modules based on
 * their locations in the project tree.
 */

const _    = require('lodash');
const path = require('path');
const Joi  = require('joi');
const fs   = require('fs');

/**
 * Modules properties.
 */
const modules     = [];
const modulesPath = path.join(__dirname, 'modules');

/**
 * Loading the modules associated with
 * the injector.
 */
fs.readdirSync(modulesPath).forEach((file) => {
  modules.push(require(path.join(modulesPath, file)));
});

/**
 * Returns the schema used to forbid
 * values from the `tree` object.
 */
const forbiddenKeys = () => {
  const object = {};

  modules.forEach((module) => {
    module.forbiddenKeys().forEach((key) => {
        object[key] = Joi.any().forbidden();
    });
  });
  return (object);
};

/**
 * The defaults values used when their
 * associated options are not specified.
 */
const defaults = {
    project: {
        base: __dirname
    },
    tree: {}
};

/**
 * The schema of the project description object.
 */
const projectSchema = {
  project: Joi.object().keys({
    base: Joi.string().required()
  }).required(),
  tree: Joi.object().keys(forbiddenKeys()).unknown().required()
};

/**
 * The schema of the options object.
 */
const optionsSchema = Joi.object().keys({
  strategy: Joi.object().keys({
    name: Joi.string().optional(),
    impl: Joi.func().optional(),
    parameters: Joi.object().optional()
  }).required()
}).optional();

/**
 * A simple helper to load a module which
 * is located in `base`.
 */
const loader = (base) => {
  return {
    load: function (pathname, name) {
      return require(path.join(base, pathname, name));
    }
  };
};

/**
 * Loads the given strategy, if any.
 */
const loadStrategy = (opts, strategy) => {
  if (_.isString(strategy.name)) {
    const impl = require('./strategies/' + strategy.name);
    impl.load(opts, strategy.parameters);
  } else if (_.isFunction(strategy.impl)) {
    strategy.impl.load(opts, strategy.parameters);
  }
};

/**
 * Creates a new injector object allowing to inject
 * modules using a local instance.
 */
const injector = (options, strategy) => {
  const inner = function () {};
  // Loading the tokens into the injector.
  _.each(options.tree, (value, key) => {
    inner.prototype[key] = (pathname) =>
      loader(options.project.base).load(value.path, pathname);
  });
  // Loading the chosen strategy, if any.
  loadStrategy(options, strategy);
  // Loading the modules.
  modules.forEach((module) => module.load(options));
  return new inner();
};

module.exports = (project, opts) => {

    project = _.isObject(project) ? project : {};

    /**
     * Using default values when they are not specified.
     */
    _.defaults(project, defaults);

    /**
     * Enforcing validation of the project tree.
     */
    if (Joi.validate(project, projectSchema).error) {
        throw new Error('Invalid project tree');
    }

    /**
     * Enforcing validation of the options.
     */
    if (Joi.validate(opts, optionsSchema).error) {
        throw new Error('Invalid options object', opts);
    }
    return (injector(project, (opts ? opts.strategy : {})));
};
