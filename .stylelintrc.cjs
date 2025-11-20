module.exports = {
  extends: ['stylelint-stylus/standard'],
  overrides: [
    {
      files: ['**/*.styl'],
      customSyntax: 'postcss-styl',
    },
  ],
  rules: {
    // Enforce Pythonic (indent-based) Stylus style that matches the existing file
    'stylus/pythonic': 'always',
    // Stylus codebase omits semicolons and colons between properties and values
    'stylus/declaration-colon': 'never',
    'stylus/semicolon': 'never',
    // Allow Tailwind + future-friendly at-rules that Stylus/Stylelint doesn't know about
    'stylus/at-rule-no-unknown': [
      true,
      {
        ignoreAtRules: ['tailwind', 'apply', 'variants', 'responsive', 'screen', 'layer'],
      },
    ],
    // PrimeNG + Angular components are custom elements (kebab-case); keep rule for typos but allow them
    'stylus/selector-type-no-unknown': [
      true,
      {
        ignore: ['custom-elements'],
        // Allow legacy pseudo-root + PrimeNG tags that include uppercase letters
        ignoreTypes: ['shtml', 'p-inputNumber', 'host'],
      },
    ],
  },
};
