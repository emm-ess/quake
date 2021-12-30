module.exports = {
    root: true,
    env: {
        es6: true,
        node: true,
    },
    parserOptions: {
        project: './tsconfig.json',
    },
    extends: '@emm-ess-configs/eslint-config/typescript',
}
