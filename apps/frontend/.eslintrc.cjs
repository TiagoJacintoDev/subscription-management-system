/** @type {import("eslint").Linter.Config} */
module.exports = {
  env: { browser: true, es2020: true },
  extends: ['@sms/eslint-config/base', 'plugin:react-hooks/recommended'],
  plugins: ['react-refresh'],
  rules: {
    'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
  },
};
