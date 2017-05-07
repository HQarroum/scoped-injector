<h1 align="center">
	<br>
	<br>
	<br>
	<br>
	<img width="600" src="https://github.com/HQarroum/scoped-injector/raw/master/docs/icon.png" alt="styleshift">
	<br>
	<br>
	<br>
	<br>
</h1>

> An opiniated `require` wrapper used to inject scoped package dependencies in Node.js.

[![Build Status](https://travis-ci.org/HQarroum/scoped-injector.svg?branch=master)](https://travis-ci.org/HQarroum/scoped-injector) [![Code Climate](https://codeclimate.com/repos/55e34093e30ba072de0013d2/badges/acc2df5cc7f78c301ad9/gpa.svg)](https://codeclimate.com/repos/55e34093e30ba072de0013d2/feed)

## Table of contents

- [Installation](#installation)
- [Description](#description)
- [Proposal](#proposal)
- [Usage](#usage)
- [Plugins](#plugins)
- [See also](#see-also)

## Installation

**Using NPM**

```bash
npm install --save scoped-injector
```

## Description

When working on a project, I find it efficient to segment my modules in well-named directories to create proper namespaces and have a sense of logical, well-organized code base so that the structure of the project speaks by itself.

This however causes sometimes the folder hierarchy on the filesystem to become quite deep, and causes the injection of module to become bloated. When you have many modules, and you need to require a bunch of them in one or many other modules, for instance using [Express](https://expressjs.com), I sometimes end up with the following statements in my code :

```javascript
const auth   = require('../../../middlewares/oauth/authenticator');
const mailer = require('../../../plugins/express/mailer');
```

The fact that the location of the files appears in every module having a dependency becomes a problem when that dependency (or the module you are requiring it from) happens to be renamed, or moved elsewhere on the filesystem.

> One solution could be to design as much of your modules as external dependencies, but that is not always the best solution for modules which are tightly bound to your project.

## Proposal

To solve this problem, I came up with the idea to centralize the structure of your project in a description file, and simply require your modules using a *scope*. Taking the previous example, here is how I would transform it into a scope-based approach :

```javascript
const $      = require('scoped-injector');
const auth   = $.middleware('oauth/authenticator');
const mailer = $.plugin('express/mailer');
```

The main advantages I see to this approach are :

 * Avoids bloating your code with module locations, and focuses on the scope of each module.
 * Prevents huge refactoring when one or many modules are moved to a different location on the filesystem.
 * Provides an elegant way to add custom behaviours to the injector through plugins (e.g read a file in memory) using the same scoped pattern.
 * Configuration is centralized in the initialization routines of the application, thus making changes very localized.
 * It does not pollute the global namespace and you can inject a different configuration in each of your module.

### Variants

Apart from requiring an instance of the scoped injector and using the methods it exposes to inject scoped dependencies, this implementation allows other [strategies](#options) to inject scoped modules, each having its strength and flaws.

#### Augmenting the require object

This strategy makes it possible to patch the `require` function in order to access scopes :

```javascript
const auth   = require.middleware('oauth/authenticator');
const mailer = require.plugin('express/mailer');
```

As always when monkey patching an existing object, this solution, even if its seems more natural in a Node.js sense, is dangerous as it modifies an existing object and its potential internal behaviour. Eventhough the [Module API](https://nodejs.org/api/modules.html#modules_modules) in Node.js is defined as *stable*, it is not advised to use this method and doing so can lead to undefined behaviour.

So what is it good for, you might ask ? I use this method in prototyping (e.g when writing temporary scripts, or small projects) in a controlled environment which is not subject to change. Using this method makes the code clearer and avoids requiring an additional dependency at the top of each module.

#### Interpolate require paths

This strategy also overrides the `require` function to provide a way to inject scoped modules. But instead of modifying the function's prototype, it creates a wrapper which intercepts the path you are passing to it, and interpolates the specified variables associated with your project tree :

```javascript
const auth   = require('${middleware}/oauth/authenticator');
const mailer = require('${plugin}/express/mailer');
```

> Note however that this strategy does not currently support the use of [plugins](#plugins).

#### Using the global namespace

Using the global namespace is bad practice in Javascript mainly because of name collisions, however we make it possible for developers to import the scoped injector to the global namespace for conditions where they are in full control of the environment and seek convenience.

In these cases, one can import a module using the `$` prefix :

```javascript
const auth   = $middleware('oauth/authenticator');
const mailer = $plugin('express/mailer');
```

This is the most convenient implementation of the scoped injector pattern, but also the most dangerous, so keep in mind to be particularly cautious when using it.

## Usage

### Project tree description

When initializing your application and before using the `scoped-injector`, you must provision it with the layout of your project tree structure on the filesystem. To do so, create a configuration file (e.g in `config/project.tree.js`) describing the structure of your project, here is an example using a sample project :

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

The base directory of the project is defined in the `base` attribute of the `project` object, it defines the root directory to start looking for modules when you require one using the scoped injector.

The `tree` object contains a collection of identifiers you can use with the scoped injector to require a module located in its associated `path` on the filesystem. For example, by specifying the `controller` token with an associated path of `controllers`, you can require any modules in its associated path as follow :

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
 - [require-interpolation](#interpolate-require-paths)

 > The injector will **always** use the `scope-local` strategy, as it is the safest solution.

You can pass additional options to specify what strategy you would like to use by specifying a `strategy` object to the injector in the project description, at initialization time :

```javascript
module.exports = {

    project: {
        base: __dirname + '/../'
    },

    tree: { ... },
    
    strategy: {
        name: 'scope-global',
	parameters: {
	    prefix: '$'
	}
    }
};
```

This will cause the injector to use the `scope-global` strategy, and the identifiers defined in your project tree to be exported in the global namespace, prepended with the `$` character :

```javascript
const users = $controller('users');
```

> Each strategy can take an optional `parameters` object as an input to customize its behaviour.

## Plugins

This module comes with a plugin interface making it possible to add additional functionalities to the loader, which can then leverage the same scoped approach. This documentation will describe the built-in plugins.

### File Path Plugin

Instead of loading a module and returning the exported object, as `require` would do it, this plugin will return the absolute path of a specified module on the filesystem.

```js
const $ = require('../lib/index.js')({
  project: {
    base: __dirname + '/../'
  },
  tree: {
    controller: {
      path: 'controllers'
    }
  }
});

// The following two methods are equivalent, and will in both
// cases return the absolute path of the `users` module.
$.path.get('controllers/users');
$.path.controller('users');
```

### File Content Plugin

This plugin will read and return the content of a specified module on the filesystem.

```js
const $ = require('../lib/index.js')({
  project: {
    base: __dirname + '/../'
  },
  tree: {
    controller: {
      path: 'controllers'
    }
  }
});

// The following two methods are equivalent, and will in both
// cases return the content of the module file.
$.content.get('controllers/users');
$.content.controller('users');
```

> You can develop your own plugins, and place them into the `lib/modules` directory of this project. They will be automatically loaded at runtime.

## Additional Examples

The [examples](examples) directory contains various samples of code demonstrating how to use the scoped injector, the built-in strategies, and how to define and load your own strategy into the injector.

## See also

 - [Better local require() paths for Node.js](https://gist.github.com/branneman/8048520)
 - [Make the require in node.js to be always relative to the root folder of the project](https://stackoverflow.com/questions/10860244/how-to-make-the-require-in-node-js-to-be-always-relative-to-the-root-folder-of-t)
 - [The Node Module wrapper](https://nodejs.org/api/modules.html#modules_the_module_wrapper)
