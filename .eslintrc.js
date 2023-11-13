module.exports = {
    env: {
        node: true,
        browser: true,
        es2017: true
    },
    extends: ['eslint:recommended', 'prettier'],
    rules: {
        // Use type-safe equality operators
        // https://eslint.org/docs/rules/eqeqeq
        eqeqeq: ['error', 'always'],

        // Treat var statements as if they were block scoped
        // https://eslint.org/docs/rules/block-scoped-var
        'block-scoped-var': 'error',

        // Disallow Use of alert, confirm, prompt
        // https://eslint.org/docs/rules/no-alert
        'no-alert': 'error',

        // Disallow eval()
        // https://eslint.org/docs/rules/no-eval
        'no-eval': 'error',

        // Disallow empty functions
        // https://eslint.org/docs/rules/no-empty-function
        'no-empty-function': 'error',

        // Require radix parameter
        // https://eslint.org/docs/rules/radix
        radix: 'error',

        // Disallow the use of `console`
        // https://eslint.org/docs/rules/no-console
        'no-console': 'error'
    },
    overrides: [
        {
            // Jasmine test files.
            files: ['tests/**/*.js'],
            env: {
                jasmine: true
            },
            parserOptions: {
                sourceType: 'module'
            }
        }
    ],
    globals: {
        Mozilla: true
    }
};
