export default {
	moduleFileExtensions: ["js", "json", "ts"],
	testRegex: ".e2e-spec.ts$",
	testEnvironment: "node",
	preset: "ts-jest",
	rootDir: "../",

	moduleNameMapper: {
		"^@docs/shared/(.*)$": "<rootDir>../src/shared/$1",
		"^@docs/common/(.*)$": "<rootDir>../src/common/$1",
		"^@docs/mocks/(.*)$": "<rootDir>/test/mocks/$1",
		"^@docs/signing/(.*)$": "<rootDir>../src/domains/signing/$1",
		"^@docs/storing/(.*)$": "<rootDir>../src/domains/storing/$1",
		"^src/(.*)$": "<rootDir>../src/$1"
	},

	transform: {
		"^.+\\.(t|j)s$": "ts-jest"
	}
}
