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
const projectSchema = Joi.object().keys({
  project: Joi.object().keys({
    base: Joi.string().required()
  }).required(),
  tree: Joi.object().keys(forbiddenKeys()).unknown().required(),
  strategy: Joi.object().keys({
    name: Joi.string().optional(),
    impl: Joi.object().optional(),
    parameters: Joi.object().optional()
  }).optional(),
  strategiesImpl: Joi.array().optional()
});

/**
 * Loads the given strategy, if any.
 */
const loadStrategy = (object, opts) => {
  const strategy = opts.strategy;
  const local    = require('./strategies/scope-local');

  // Initializing the strategies array.
  opts.strategiesImpl = [];

  // Loading built-in `scope-local` strategy.
  local.load(opts, { object });
  opts.strategiesImpl.push(local);

  // Loading custom strategy.
  if (strategy) {
    if (_.isString(strategy.name)) {
      const impl = require('./strategies/' + strategy.name);
      impl.load(opts, strategy.parameters);
      opts.strategiesImpl.push(impl);
    } else if (_.isObject(strategy.impl)) {
      strategy.impl.load(opts, strategy.parameters);
      opts.strategiesImpl.push(strategy.impl);
    }
  }
};

/**
 * Creates a new injector object allowing to inject
 * modules using a local instance.
 */
const injector = (opts) => {
  const inner = {};
  // Loading the chosen strategy, if any.
  loadStrategy(inner, opts);
  // Loading the modules.
  modules.forEach((module) => module.load(opts));
  return (inner);
};

module.exports = (project) => {

    project = _.isObject(project) ? project : {};

    /**
     * Using default values when they are not specified.
     */
    _.defaults(project, defaults);

    /**
     * Enforcing validation of the project tree.
     */
    const error = projectSchema.validate(project).error;
    if (error) {
        throw new Error(`Invalid project tree: ${error}`);
    }
    return (injector(project));
};
