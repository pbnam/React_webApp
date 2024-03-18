module.exports = {
    env: {
        node: true,
        browser: true,
        es6: true,
    },
    parser: '@typescript-eslint/parser',
    extends: ['eslint:recommended', 'plugin:react/recommended', 'plugin:prettier/recommended'],
    globals: {
        Atomics: 'readonly',
        SharedArrayBuffer: 'readonly',
    },
    parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
        ecmaFeatures: {
            tsx: true,
        },
    },
    rules: {
        'prettier/prettier': ['warn', { endOfLine: 'auto' }],
        'no-unused-vars': ['warn', { vars: 'all', args: 'none' }],
        'react/jsx-key': 'warn',
        'array-element-newline': 0,
        'default-case': 'warn',
        'no-loop-func': 'warn',
    },
    settings: {
        react: { version: 'detect' },
    },
};
