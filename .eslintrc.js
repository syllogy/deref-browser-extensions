module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    'prettier',
    'plugin:react/recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:eslint-comments/recommended',

    // The following imports the rules from the errors and warnings files here:
    // https://github.com/benmosher/eslint-plugin-import/tree/master/config
    'plugin:import/errors',
    'plugin:import/warnings',
  ],
  ignorePatterns: ['node_modules', '.eslintrc.js'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: ['./tsconfig.json'],
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 12,
    sourceType: 'module',
  },
  plugins: ['react', 'react-hooks', '@typescript-eslint', 'import'],
  settings: {
    react: {
      version: 'latest',
    },
    'import/resolver': {
      typescript: {
        project: ['tsconfig.json'],
      },
    },
  },
  rules: {
    'no-restricted-globals': ['error', 'name'],

    'import/no-internal-modules': ['error', { allow: ['!(@deref)'] }],
    'import/no-cycle': 'error',

    // The following disables overly strict rules from the import module.
    'import/named': 'off',
    'import/default': 'off',
    'import/no-named-as-default': 'off',
    'import/no-named-as-default-member': 'off',
    'import/namespace': ['error', { allowComputed: true }],

    // Type inference is useful; this rule is overkill.
    '@typescript-eslint/explicit-module-boundary-types': 'off',

    // Disallow cryptic type parameter names.
    '@typescript-eslint/naming-convention': [
      'error',
      {
        selector: 'typeParameter',
        format: ['PascalCase'],
        prefix: ['T'],
      },
    ],

    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        // Unused arguments are common when trying to satisfy an interface.
        args: 'none',
        // Use a leading underscore to explicitly ignore an unused variable.
        // Also, there is no way to ignore unused type arguments, which
        // are useful for phantom types. Take advantage of the naming
        // convention for type parameters to ignore those.
        varsIgnorePattern: '^((_.+)|T([A-Z].+)?)',
      },
    ],

    // TODO: Re-enable this rule.
    '@typescript-eslint/no-explicit-any': 'off',

    'no-constant-condition': [
      'error',
      {
        // while (true) loops are useful.
        checkLoops: false,
      },
    ],

    // Empty interfaces are sometimes useful for documentation purposes.
    '@typescript-eslint/no-empty-interface': 'off',

    // Require justifications for disabling eslint.
    'eslint-comments/no-unused-disable': 'error',
    'eslint-comments/require-description': [
      'error',
      { ignore: ['eslint-enable'] },
    ],

    // Catch some easy-to-make-mistakes.
    '@typescript-eslint/no-floating-promises': 'error',

    // Require trailing newlines.
    'eol-last': 'error',

    // Enforce type safety for catch blocks.
    '@typescript-eslint/no-implicit-any-catch': 'error',

    // Warn when awaiting an unawaitable value.
    '@typescript-eslint/await-thenable': 'error',

    // Disallow block comments
    'multiline-comment-style': ['error', 'separate-lines'],

    // Disallow merged variable declarations
    'one-var': ['error', 'never'],

    // Disallow Use of Chained Assignment Expressions
    'no-multi-assign': 'error',
  },
  overrides: [
    {
      files: ['*.js'],
      rules: {
        'react/react-in-jsx-scope': 'error', // We don't want automatic import magic.
        'react-hooks/rules-of-hooks': 'error', // Checks rules of Hooks
        'react-hooks/exhaustive-deps': 'warn', // Checks effect dependencies
        'react/prop-types': 'off', // Rely on TypeScript.

        // Since all application code should be TypeScript, assume that any
        // *.js file isn't because it's used during process startup or
        // tooling configuration in some way. As such, it's not subject to
        // transpilation, so it can't use ES modules syntax. Even if it could,
        // it would probably only want to use a dynamic imports anyway.
        '@typescript-eslint/no-var-requires': 'off',
      },
    },
  ],
};
