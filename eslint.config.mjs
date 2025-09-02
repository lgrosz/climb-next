import { FlatCompat } from "@eslint/eslintrc";

const compat = new FlatCompat({
  baseDirectory: import.meta.dirname,
});

const eslintConfig = [
  ...compat.config({
    extends: [
      "next/typescript",
      "next",
    ],
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_$",
          varsIgnorePattern: "^_$",
        },
      ],
    },
  }),
];

export default eslintConfig;
