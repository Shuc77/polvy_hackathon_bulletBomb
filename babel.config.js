const isProd = process.env.NODE_ENV === 'production';
const ProdPlugins = isProd
  ? [['transform-remove-console', { exclude: ['error', 'warn', 'info'] }]] // @PLV-WARN
  : [];

module.exports = {
  presets: [
    [
      '@vue/cli-plugin-babel/preset',
      {
        useBuiltIns: 'usage',
        corejs: 3,
        modules: false,
        jsx: false,
      },
    ],
    ['@vue/babel-preset-jsx', { compositionAPI: true }],
  ],
  plugins: [['@babel/plugin-transform-typescript', { isTSX: true }], ...ProdPlugins],
};
