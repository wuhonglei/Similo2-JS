module.exports = {
  env: {
    browser: true,
    commonjs: true,
    es2021: true,
  },
  extends: ['airbnb-base', 'prettier'],
  overrides: [],
  parserOptions: {
    ecmaVersion: 'latest',
  },
  rules: {
    'no-eval': 'off',
    'no-shadow': 'off',
    'no-bitwise': 'off',
    'no-plusplus': 'off',
    'default-case': 'off',
    'no-await-in-loop': 'off',
    'no-console': 'off',
    'no-unused-vars': 'warn',
    'no-param-reassign': 'off',
    'no-case-declarations': 'off',
    'no-unused-expressions': 'off',
    'import/prefer-default-export': 'off',
  },
};
