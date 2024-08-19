module.exports = {
	parser: "@typescript-eslint/parser",
	parserOptions: {
		project: "tsconfig.json",
		tsconfigRootDir: __dirname,
		sourceType: "module"
	},
	plugins: ["@typescript-eslint/eslint-plugin"],
	extends: [
		"plugin:@typescript-eslint/eslint-recommended",
		"plugin:@typescript-eslint/recommended",
		"plugin:prettier/recommended"
	],
	root: true,
	env: {
		node: true,
		jest: true
	},
	ignorePatterns: [".eslintrc.js"],
	rules: {
		"no-mixed-spaces-and-tabs": ["error", "smart-tabs"],
		semi: ["error", "never"],
		"linebreak-style": "off",
		"require-jsdoc": "off",
		"no-console": "off",
		"no-tabs": "off",
		camelcase: "off",
		indent: "off",

		// ts
		"@typescript-eslint/explicit-module-boundary-types": "off",
		"@typescript-eslint/no-non-null-assertion": "off",
		"@typescript-eslint/no-inferrable-types": "off",
		"@typescript-eslint/no-empty-function": "off",
		"@typescript-eslint/no-explicit-any": "off",
		"@typescript-eslint/no-var-requires": "off",
		"@typescript-eslint/ban-ts-comment": "off",
		"@typescript-eslint/no-unused-vars": "off",
		"@typescript-eslint/no-this-alias": "off",
		"@typescript-eslint/no-namespace": "off",
		"@typescript-eslint/quotes": "off"
	}
}
