const js = require('@eslint/js');
const globals = require('globals');
const eslintConfigPrettier = require('eslint-config-prettier');

const rules = {
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
};

module.exports = [
    js.configs.recommended,
    eslintConfigPrettier,
    {
        ignores: ['dist/**/*.js', 'demo/libs/**/*.js', 'tests/dist/**/*.js']
    },
    {
        files: ['src/**/*.js'],
        languageOptions: {
            ecmaVersion: 2017,
            globals: {
                Mozilla: true,
                ...globals.browser,
                ...globals.commonjs
            }
        },
        rules: rules
    },
    {
        files: ['demo/**/*.js'],
        languageOptions: {
            ecmaVersion: 'latest',
            globals: {
                Mozilla: true,
                ...globals.browser,
                ...globals.node,
                ...globals.commonjs
            }
        },
        rules: rules
    },
    {
        files: ['tests/**/*.js'],
        languageOptions: {
            ecmaVersion: 'latest',
            sourceType: 'module',
            globals: {
                Mozilla: true,
                ...globals.browser,
                ...globals.jasmine
            }
        },
        rules: rules
    },
    {
        files: [
            'webpack.config.js',
            'webpack.test.config.js',
            'eslint.config.js'
        ],
        languageOptions: {
            ecmaVersion: 'latest',
            globals: {
                ...globals.node,
                ...globals.commonjs
            }
        },
        rules: rules
    }
];
