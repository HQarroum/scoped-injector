<br/><br/><p align="center"><img width="380" src="docs/images/icon.png" /></p><br/>

# scoped-injector
> An opiniated `require` wrapper used to inject scoped package dependencies in Node.js.

[![Build Status](https://travis-ci.org/HQarroum/timed-cache.svg?branch=master)](https://travis-ci.org/HQarroum/scoped-injector) [![Code Climate](https://codeclimate.com/repos/55e34093e30ba072de0013d2/badges/acc2df5cc7f78c301ad9/gpa.svg)](https://codeclimate.com/repos/55e34093e30ba072de0013d2/feed)

## Table of contents

- [Installation](#installation)
- [Description](#description)
- [Proposal](#proposal)
- [Usage](#usage)
- [Plugins](#plugins)

## Installation

```bash
npm install --save scoped-injector
```

## Description

When using Node.js (and other frameworks or languages than Javascript as well), I find it efficient to segment my modules in well-named directory to create namespaces and have a sense of logical, well-organized code base so that the structure of the project speaks by itself.

This however causes sometimes the folder hierarchy on the filesystem to become quite deep, and makes the injection of module to become bloated. When you have many modules and you need to require a bunch of them in one or many other modules, for instance using `Express`, I sometimes end up with the following statements in one of my modules :

```javascript
const auth   = require('../../../middlewares/oauth/authenticator');
const mailer = require('../../../plugins/express/mailer');
```

The fact that the location of the files appears in every module having a dependency becomes a problem when that dependency (or the module you are requiring it from) happens to be renamed, or moved elsewhere on the filesystem.

> One solution could be to design as much of your modules as external dependencies when possible, but that is not always the best solution for modules which are tightly bound to your project.

## Proposal

To solve this problem, I came up with the idea to centralize the structure of your modules in a description file, and simply require them using a *scope*. Taking the previous example, here is how I would bind it to a scope based approach :

```javascript
const $      = require('scoped-injector');
const auth   = $.middleware('oauth/authenticator');
const mailer = $.plugin('express/mailer');
```

The main advantages I see to this approach are :

 * It makes it possible to avoid bloating your code with module locations, and focuses on the scope of each module.
 * Prevents huge refactoring when one or many modules are moved to a different location on the filesystem.
 * Provides an elegant way to add custom behaviours to the injector through plugins (e.g read a file in memory) using the same scoped pattern.
 * Configuration is centralized in the initialization routines of the application, thus making changes very localized.
 * It does not pollute the global namespace and you can inject a different configuration in each of your module.

### Variants

Apart from requiring an instance of the scoped injector and using its method to inject scoped dependencies, this implementation allows various methods for using the scoped injector, each having its strength and flaws.

#### Patching the require object

This method makes it possible to patch the `require` global identifier in order to access scopes from within it :

```javascript
const auth   = require.middleware('oauth/authenticator');
const mailer = require.plugin('express/mailer');
```

As always when monkey patching an existing object, this solution, even if its seems more natural in a Node.js sense, is dangerous as it modifies an existing object and its potential internal behaviour. Eventhough the Modules API in Node.js is *locked*, it is not advised to use this method and doing so can lead to undefined behaviour.

So what is it good for, you might ask ? I use this method in a constrained environment (e.g writing temporary scripts, or small projects) which is controlled and not subject to change. Using this method makes the code clearer and avoids requiring an additional dependency at the top of each module.

#### Using the global namespace

Similarly, using the global namespace is bad practice in Javascript because of name collisions, however we make it possible for developers to import the scoped injector to the global namespace for conditions where they are in full control of the environment and they seek commodity.

In these cases, one can import a module using the `$` prefix :

```javascript
const auth   = $middleware('oauth/authenticator');
const mailer = $plugin('express/mailer');
```

This is the most convenient implementation of the scoped injector pattern, but also the most dangerous, so keep in mind to be particularly cautious when using it.

## Usage

### Project tree description

When initializing your application and before using the `scoped-injector`, you must provision it with the layout of your module tree structure on the filesystem. To do so, create a configuration file (e.g in `config/project.tree.js`) describing the structure of your project, here is an example using `Express` :

The `bin/www` initialization module :

```javascript
 require('scoped-injector')(
    require('../config/project.tree')
 );
```

The `config/project.tree.js` description module :

```javascript
module.exports = {

    project: {
        base: __dirname + '/../'
    },

    tree: {
        controller: {
            path: 'controllers'
        },

        model: {
            path: 'models'
        },

        route: {
            path: 'routes'
        }
    }
};
```

The base directory of the project is defined in the `base` attribute of the `project` object, this defines the root directory to start looking for modules when you require one using the scoped injector.

The `tree` object containes a collection of tokens you can use with the scoped injector to require a module located in its associated `path` on the filesystem. For example, by specifying the `controller` token with an associated path of `controllers`, you can require any modules in its associated path as follow :

```javascript
const $     = require('scoped-injector');
const users = $.controller('users');
```

> Here, the specified `users` module is in fact located in `${project-base-directory}/controllers/users.js` on the filesystem.

### Options

The injector can take additional parameters to specify the scope strategy which will be used to make itself available to the developer. There are three available strategies, each of them are described in the [Proposal](#proposal) section :

 - [scope-local](#proposal)
 - [scope-require](#patching-the-require-object)
 - [scope-global](#using-the-global-namespace)

 > The injector will **always** use the `scope-local` strategy as it is the safest solution.

You can pass an `options` object to the injector as its second argument at initialization time :

```javascript
/**
 * This cause the injector to export the tokens in
 * your project tree in the global namespace and to
 * prepend them with the `$` character :
 * const users = $controller('users');
 */
require('scoped-injector')(
   require('../config/project.tree'), {
    strategy: {
     name: 'scope-global',
     parameters: {
      prefix: '$'
     }
    }
   }
);
```

> Each strategy can take an optional `parameters` object as an input to customize its behaviour.

## Plugins

This module comes with a plugin interface making it possible to add additional functionalities to the loader, which can then leverage the same scoped approach.
