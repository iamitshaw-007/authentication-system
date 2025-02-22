const commitLintConfig = {
    /* Extends the conventional commit rules */
    extends: ["@commitlint/cli", "@commitlint/config-conventional"],

    /* Custom rules for commit messages */
    rules: {
        /*
         * Type Rules
         */
        "type-enum": [
            2 /* Level: 0 - disable, 1 - warning, 2 - error */,
            "always" /* Applicable condition: 'always' or 'never' */,
            [
                "build" /* Changes that affect the build system or external dependencies */,
                "chore" /* Other changes that don't modify src or test files */,
                "ci" /* Changes to our CI configuration files and scripts */,
                "docs" /* Documentation only changes */,
                "feature" /* A new feature */,
                "fix" /* A bug fix */,
                "performance" /* A code change that improves performance */,
                "refactor" /* A code change that neither fixes a bug nor adds a feature */,
                "revert" /* Reverts a previous commit */,
                "style" /* Changes that do not affect the meaning of the code (white-space, formatting, etc) */,
                "test" /* Adding missing tests or correcting existing tests */,
            ],
        ],
        "type-case": [
            2 /* Level */,
            "always" /* Applicable condition */,
            "lower-case" /* Enforced case */,
        ],
        "type-empty": [2 /* Level */, "never" /* Type cannot be empty */],

        /*
         * Scope Rules
         */
        "scope-enum": [
            2 /* Level */,
            "always" /* Applicable condition */,
            [
                "api" /* API changes */,
                "auth" /* Authentication changes */,
                "ui" /* User Interface changes */,
                "config" /* Configuration changes */,
                "docs" /* Documentation changes */,
            ],
        ],
        "scope-case": [
            2 /* Level */,
            "always" /* Applicable condition */,
            "lower-case" /* Enforced case */,
        ],
        "scope-empty": [2 /* Level */, "never" /* Scope cannot be empty */],

        /*
         * Subject Rules
         */
        "subject-case": [
            2 /* Level */,
            "never" /* Applicable condition */,
            [
                "sentence-case",
                "start-case",
                "pascal-case",
                "upper-case",
            ] /* Disallowed cases */,
        ],
        "subject-full-stop": [
            2 /* Level */,
            "never" /* Subject cannot end with a period */,
            ".",
        ],
        "subject-min-length": [
            2 /* Level */,
            "always" /* Applicable condition */,
            10 /* Minimum length of the subject */,
        ],
        "subject-max-length": [
            2 /* Level */,
            "always" /* Applicable condition */,
            50 /* Maximum length of the subject */,
        ],
        "subject-empty": [2 /* Level */, "never" /* Subject cannot be empty */],

        /*
         * Body Rules
         */
        "body-leading-blank": [
            2 /* Level */,
            "always" /* Must have a blank line before the body */,
        ],
        "body-min-length": [
            2 /* Level */,
            "always" /* Applicable condition */,
            20 /* Minimum length of the body */,
        ],
        "body-max-length": [
            2 /* Level */,
            "always" /* Applicable condition */,
            100 /* Maximum length of the body */,
        ],
        "body-empty": [2 /* Level */, "always" /* Body cannot be empty */],

        /*
         * Footer Rules
         */
        "footer-leading-blank": [
            2 /* Level */,
            "always" /* Must have a blank line before the footer */,
        ],
        "footer-min-length": [
            2 /* Level */,
            "always" /* Applicable condition */,
            10 /* Minimum length of the footer */,
        ],
        "footer-max-length": [
            2 /* Level */,
            "always" /* Applicable condition */,
            50 /* Maximum length of the footer */,
        ],
    },
};

export default commitLintConfig;
