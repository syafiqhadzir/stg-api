const globals = require("globals");
const pluginJs = require("@eslint/js");
const tseslint = require("typescript-eslint");
const eslintConfigPrettier = require("eslint-config-prettier");

module.exports = tseslint.config(
    { files: ["**/*.{js,mjs,cjs,ts}"] },
    { languageOptions: { globals: globals.node } },
    pluginJs.configs.recommended,
    ...tseslint.configs.strictTypeChecked.map((config) => ({
        ...config,
        files: ["**/*.ts"],
    })),
    ...tseslint.configs.stylisticTypeChecked.map((config) => ({
        ...config,
        files: ["**/*.ts"],
    })),
    {
        files: ["**/*.ts"],
        languageOptions: {
            parserOptions: {
                project: true,
                tsconfigRootDir: __dirname,
            },
        },
        rules: {
            // Fastify uses callbacks with unbound methods, which is safe in this context
            "@typescript-eslint/unbound-method": "off",
            // Allow promises to not be awaited when registering plugins (Fastify pattern)
            "@typescript-eslint/no-misused-promises": ["error", { checksVoidReturn: false }],
            // Allow explicit any in specific cases (e.g., Fastify request generics)
            "@typescript-eslint/no-explicit-any": "warn",
            // Allow non-null assertions in controlled scenarios
            "@typescript-eslint/no-non-null-assertion": "warn",
            // Fastify's dynamic plugin loading triggers these; safe in this context
            "@typescript-eslint/no-unsafe-call": "off",
            "@typescript-eslint/no-unsafe-assignment": "off",
            "@typescript-eslint/no-unsafe-member-access": "off",
            "@typescript-eslint/no-unsafe-argument": "off",
            "@typescript-eslint/no-unsafe-return": "off",
        },
    },
    eslintConfigPrettier
);
