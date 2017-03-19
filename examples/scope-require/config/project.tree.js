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
        }
    },

    strategy: {
      name: 'scope-require'
    }
};
