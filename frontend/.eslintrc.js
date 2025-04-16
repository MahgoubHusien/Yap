/** @type {import("eslint").Linter.Config} */
module.exports = {
    root: true,
    extends: ['next', 'next/core-web-vitals', 'plugin:@typescript-eslint/recommended'],
    rules: {
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      'react-hooks/exhaustive-deps': 'warn',
    },
  };
  