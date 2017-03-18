var should = require('should');

describe('The dependency injector', function () {

  /**
   * Testing the configuration process of the
   * dependency injector module.
   */
  describe('configuration process', function () {

    /**
     * Checking whether the module refuses an empty
     * configuration.
     */
    it('should accept an empty configuration', function () {
      require(__dirname + '/../lib/index.js')();
    })

    /**
     * Checking whether the module does not accept a
     * configuration which is invalid.
     */
    it('should not accept an invalid configuration', function () {
      // Testing with an invalid project path.
      try {
        require(__dirname + '/../lib/index.js')({ foo: 'bar' });
      } catch (e) {
        return;
      }

      // Testing with an invalid `options` object.
      try {
        require(__dirname + '/../lib/index.js')(undefined, { foo: 'bar' });
      } catch (e) {
        return;
      }
      throw new Error('Failed');
    })

    /**
     * Checking whether the module accepts a valid configuration.
     */
    it('should accept a valid configuration object', function () {
      require(__dirname + '/../lib/index.js')({
        project: {
          base: __dirname + '/../'
        },
        tree: {
          controllers: {
            path: 'controllers'
          }
        }
      });
    })

    /**
     * Some keys in the `tree` object are reserved, we check if the
     * module refuses a configuration with those keys defined.
     */
    it('should not accept forbidden values as keys', function () {
      try {
        require(__dirname + '/../lib/index.js')({
          project: {
            base: __dirname + '/../'
          },
          tree: {
            path: {
              path: 'path'
            },
            content: {
              path: 'content'
            }
          }
        }
      );
      } catch (e) { return; }
      throw new Error('Failed');
   })

  })

  /**
   * Testing whether injectors are correctly exported.
   */
  describe('export process', function () {

    it('should be able to export the given paths into the returned local instance', function () {
      const $ = require(__dirname + '/../lib/index.js')({
        project: {
          base: __dirname + '/../'
        },
        tree: {
          lib: {
            path: 'lib'
          },
          test: {
            path: 'test'
          }
        }
      });
      (typeof $.lib('index')).should.equal('function');
      should.exist($.test('index'));
    })

    /**
     * Testing the default behaviour of the injector.
     */
    it('should not be able to export the given paths into the global namespace by default', function () {
      require(__dirname + '/../lib/index.js')({
        project: {
          base: __dirname + '/../'
        },
        tree: {
          lib: {
            path: 'lib'
          },
          test: {
            path: 'test'
          }
        }
      });

      (global.$lib === undefined).should.be.true();
      (global.$test === undefined).should.be.true();
    })

    /**
     * Testing export in the global namespace using the
     * `scope-global` strategy.
     */
    it('should be able to export the given paths into the global namespace', function () {
      require(__dirname + '/../lib/index.js')({
        project: {
          base: __dirname + '/../'
        },
        tree: {
          lib: {
            path: 'lib'
          },
          test: {
            path: 'test'
          }
        }
      }, {
        strategy: {
          name: 'scope-global'
        }
      });

      should.exist($lib('index'));
      should.exist($test('index'));
    })

    /**
     * Testing export in the require namespace using the
     * `scope-require` strategy.
     */
    it('should be able to export the given paths into the require namespace', function () {
      require(__dirname + '/../lib/index.js')({
        project: {
          base: __dirname + '/../'
        },
        tree: {
          lib: {
            path: 'lib'
          },
          test: {
            path: 'test'
          }
        }
      }, {
        strategy: {
          name: 'scope-require',
          parameters: {
            require: require
          }
        }
      });

      should.exist(require.lib('index'));
      should.exist(require.test('index'));
    })

    it('should be able to get the absolute path of a module', function () {
      require(__dirname + '/../lib/index.js')({
        project: {
          base: __dirname + '/../'
        },
        tree: {
          lib: {
            path: 'lib'
          },
          test: {
            path: 'test'
          }
        }
      });

      should.exist($path.get('index'));
      should.exist($path.lib('index'));
      should.exist($path.test('index'));
    })
  })

  it('should be able to get the content of a module', function () {
    require(__dirname + '/../lib/index.js')({
      project: {
        base: __dirname + '/../'
      },
      tree: {
        index: {
          path: 'lib'
        }
      }
    });

    $content.get('lib/index.js', function (err, content) {
      should.not.exist(err);
      should.exist(content);
    });

    $content.index('index.js', function (err, content) {
      should.not.exist(err);
      should.exist(content);
    });
  })
})