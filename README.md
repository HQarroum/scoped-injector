<p align="center">
 <img width="450" src="lighthouse.png" />
</p>
<br/>

# Lighthouse

An opiniated `require` wrapper used to inject scoped package dependencies in Node.js.

Current version: **1.0.5**

Lead Maintainer: [Halim Qarroum](mailto:hqm.post@gmail.com)

## Install

```bash
npm install --save lighthouse
```

## Description

I find it to be very cumbersome to inject modules located in your own project using `require` when the code base becomes dense, and the hierarchy of the modules in the project is deep enough. I like to segment my modules in well-named directory to create namespaces and find my code logically organized, so the structure of the projects speaks by itself.

This often comes at a cost when you have many modules and you need to require a bunch of them in one or many other modules, for instance using `Express` I sometimes end up with the following statements in my `app.js` :

```javascript
var db      = require('../services/db-wrapper');
var auth    = require('../middlewares/express/oauth/authenticator');
var loader  = require('../plugins/express/loader');
var config  = require('../config/passport/oauth');
```

I don't like the fact that the location of the files on the filesystem appears in every module in which you need to inject another module from the project, and the need to refactor every module dependent on a particular dependency when this module happens to be renamed, or moved elsewhere.

> Of course, you should try to build your module as an external dependency (accessible via `npm` for instance) when possible, but that is not always the best solution for modules which are tightly bound to your project.

## Proposal

To resolve this problem, I came up with the idea to centralize the structure of your modules in a description file, and simply require them using a *scope*. Taking the previous example, here is how I would bind it to a scope based approach :

```javascript
var $      = require('scoped-injector');
var db     = $middleware('db-wrapper');
var oauth  = $middleware('oauth');
var config = $config('express');
```

The main advantages I see to this approach are :

 * It makes it possible to avoid bloating your code with module locations, and focuses on the scope of each module (pretty much the same as when you require an external module).
 * Prevents huge refactoring when one or many modules are moved to a different location on the filesystem.
 * Provides an elegant way to add custom behaviours to the injector through plugins (e.g read a file in memory) using the same scoped pattern.
 * Configuration is centralized in the initialization routines of the application, thus making changes very localized.
 * It does not pollute the global namespace and you can inject a different configuration in each of your module.

## Plugins

This module comes with a plugin interface making it possible to add additional functionalities to the loader, which can then leverage the same scoped approach.
