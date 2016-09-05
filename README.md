<br/><br/>
<p align="center">
 <img width="450" src="lighthouse.png" />
</p>
<br/><br/>

# Lighthouse

An opiniated `require` wrapper used to inject scoped package dependencies in Node.js.

Current version: **1.0.5**

Lead Maintainer: [Halim Qarroum](mailto:hqm.post@gmail.com)

## Install

```bash
npm install --save lighthouse
```

## Description

When using Node.js (and other frameworks or languages than Javascript as well), I find it efficient to segment my modules in well-named directory to create namespaces and have a sense of logical, well-organized code base so that the structure of the project speaks by itself.

This however causes sometimes the folder hierarchy on the filesystem to become quite deep, and makes the injection of module to become bloated. When you have many modules and you need to require a bunch of them in one or many other modules, for instance using `Express`, I sometimes end up with the following statements in one of my modules :

```javascript
var auth    = require('../../../middlewares/oauth/authenticator');
var mailer  = require('../../../plugins/express/mailer');
```

The fact that the location of the files appears in every module having a dependency becomes a problem when that dependency (or the module you are requiring it from) happens to be renamed, or moved elsewhere on the filesystem.

> One solution could be to design as much of your modules as external dependencies when possible, but that is not always the best solution for modules which are tightly bound to your project.

## Proposal

To solve this problem, I came up with the idea to centralize the structure of your modules in a description file, and simply require them using a *scope*. Taking the previous example, here is how I would bind it to a scope based approach :

```javascript
var $      = require('scoped-injector');
var auth   = $.middleware('oauth/authenticator');
var mailer = $.plugins('express/mailer');
```

The main advantages I see to this approach are :

 * It makes it possible to avoid bloating your code with module locations, and focuses on the scope of each module.
 * Prevents huge refactoring when one or many modules are moved to a different location on the filesystem.
 * Provides an elegant way to add custom behaviours to the injector through plugins (e.g read a file in memory) using the same scoped pattern.
 * Configuration is centralized in the initialization routines of the application, thus making changes very localized.
 * It does not pollute the global namespace and you can inject a different configuration in each of your module.

## Plugins

This module comes with a plugin interface making it possible to add additional functionalities to the loader, which can then leverage the same scoped approach.
