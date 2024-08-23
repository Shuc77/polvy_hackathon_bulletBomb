const isProd = process.env.NODE_ENV === 'production';
const ProdPlugins = isProd
  ? [['transform-remove-console', { exclude: ['error', 'warn', 'info'] }]] // @PLV-WARN
  : [];

module.exports = {
  presets: [
    [
      '@vue/cli-plugin-babel/preset',
      {
        jsx: false,
      },
    ],
    ['@vue/babel-preset-jsx', { compositionAPI: true }],
  ],
  plugins: [
    ['@babel/plugin-transform-typescript', { isTSX: true }],
    '@babel/plugin-proposal-nullish-coalescing-operator',
    '@babel/plugin-proposal-optional-chaining',
    ...ProdPlugins,
  ],
};
