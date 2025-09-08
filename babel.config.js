const module_resolver = [
  'module-resolver',
  {
    alias: {
      '@assets': './app/assets',
      '@components': './app/components',
      '@config': './app/config',
      '@hooks': './app/hooks',
      '@lang': './app/lang',
      '@navigation': './app/navigation',
      '@redux': './app/redux',
      '@screens': './app/screens',
      '@utils': './app/utils',
    },
  },
];

module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: ['react-native-reanimated/plugin', module_resolver],
};
