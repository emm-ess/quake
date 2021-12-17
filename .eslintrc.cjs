module.exports = {
    root: true,
    env: {
        es6: true,
        node: true,
    },
    parserOptions: {
        parser: '@typescript-eslint/parser',
        project: './tsconfig.json',
    },
    extends: [
        'emm-ess-base/typescript',
    ],
}
