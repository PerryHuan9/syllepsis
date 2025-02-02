module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  env: {
    browser: true,
    node: true,
  },
  globals: {
    page: 'readonly',
  },
  plugins: ['@typescript-eslint', 'react', 'import', 'simple-import-sort'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:import/errors',
    'plugin:import/warnings',
    'plugin:import/typescript',
  ],
  rules: {
    '@typescript-eslint/ban-ts-comment': 'off',
    '@typescript-eslint/ban-types': 'error',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-empty-function': 'off',
    '@typescript-eslint/no-empty-interface': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-inferrable-types': 'error',
    '@typescript-eslint/no-namespace': 'error',
    '@typescript-eslint/no-non-null-assertion': 'off',
    '@typescript-eslint/no-this-alias': 'off',
    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        args: 'none',
        argsIgnorePattern: '^T$',
        ignoreRestSiblings: true,
      },
    ],
    '@typescript-eslint/no-var-requires': 'off',
    'arrow-body-style': 'error',
    'arrow-parens': ['off', 'always'],
    'comma-spacing': [
      'error',
      {
        after: true,
        before: false,
      },
    ],
    'computed-property-spacing': ['error', 'never'],
    'dot-notation': ['error'],
    eqeqeq: ['error'],
    'import/export': 'error',
    'import/exports-last': 'error',
    'import/first': 'error',
    'import/group-exports': 'error',
    'import/newline-after-import': 'error',
    'import/no-default-export': 'error',
    'import/no-duplicates': 'error',
    'import/no-unused-modules': 'error',
    'no-async-promise-executor': 'off',
    'no-cond-assign': 'off',
    'no-eq-null': 'error',
    'no-extra-boolean-cast': 'off',
    'no-lone-blocks': 'error',
    'no-multi-spaces': [
      'error',
      {
        ignoreEOLComments: true,
      },
    ],
    'no-new': 'error',
    'no-param-reassign': 'error',
    'no-prototype-builtins': 'off',
    'no-unused-vars': 'off',
    'no-var': 'error',
    'object-curly-spacing': ['error', 'always'],
    'prefer-arrow-callback': 'error',
    'prefer-const': 'error',
    'prefer-rest-params': 'off',
    'prefer-spread': 'off',
    quotes: [1, 'single'],
    'semi-spacing': 'error',
    'simple-import-sort/exports': 'warn',
    'simple-import-sort/imports': 'warn',
  },
};
