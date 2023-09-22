const isProd = process.env.NODE_ENV === 'production';
const ProdPlugins = isProd
  ? [['transform-remove-console', { exclude: ['error', 'warn', 'info'] }]] // @PLV-WARN
  : [];

module.exports = {
  presets: ['@vue/cli-plugin-babel/preset'],
  plugins: [
    '@babel/plugin-proposal-nullish-coalescing-operator',
    '@babel/plugin-proposal-optional-chaining',
    ...ProdPlugins,
  ],
};
