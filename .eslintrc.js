/* eslint-env node */

module.exports = {
  root: true,
  extends: [
    './node_modules/@polyv/eslint-config/lib/for-vue',
    './node_modules/@polyv/eslint-config/lib/for-ts',
    'plugin:prettier/recommended',
  ],
  parserOptions: {
    parser: '@typescript-eslint/parser',
    extraFileExtensions: ['.vue'],
  },
  globals: {
    PROJECT_BUILD_TIME: 'readonly',
    PROJECT_VERSION: 'readonly',
  },
  rules: {
    'no-console': 'off',
    'prettier/prettier': 'warn',
    'vue/v-on-event-hyphenation': [
      'warn',
      'always',
      {
        ignore: ['statusChange'],
      },
    ],
    '@typescript-eslint/no-empty-function': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
  },
};
