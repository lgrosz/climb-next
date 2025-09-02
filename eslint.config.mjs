import reactHooks from "eslint-plugin-react-hooks";
import { FlatCompat } from "@eslint/eslintrc";

const compat = new FlatCompat({
  baseDirectory: import.meta.dirname,
});

const eslintConfig = [
  ...compat.config({
    extends: [
      "next/typescript",
      /*"next",*/ // TODO rushstack#4965
      "plugin:react/recommended",
      "plugin:react/jsx-runtime",
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
  reactHooks.configs["recommended-latest"],
];

export default eslintConfig;
