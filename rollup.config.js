import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import strip from '@rollup/plugin-strip';
import pkg from './package.json';

export default [
    // browser-friendly UMD build
    {
        input: 'src/m-dot-nav.js',
        external: ['mithril'],
        output: {
            name: 'mdotnav',
            file: pkg.browser,
            format: 'umd'
        },
        plugins: process.env.BUILD === 'development'
            ? [
                resolve(), // so Rollup can find `ms`
                commonjs() // so Rollup can convert `ms` to an ES module
            ]
            : [
                strip({
                   include: ['src/m-dot-nav.js'],
                }),
                resolve(), // so Rollup can find `ms`
                commonjs() // so Rollup can convert `ms` to an ES module
            ]
    },

    // CommonJS (for Node) and ES module (for bundlers) build.
    // (We could have three entries in the configuration array
    // instead of two, but it's quicker to generate multiple
    // builds from a single configuration where possible, using
    // an array for the `output` option, where we can specify
    // `file` and `format` for each target)
    {
        input: 'src/m-dot-nav.js',
        external: ['mithril'],
        output: [
            {file: pkg.main, format: 'cjs'},
            {file: pkg.module, format: 'es'}
        ],
        plugins: process.env.BUILD === 'development'
            ? [
                resolve(), // so Rollup can find `ms`
                commonjs() // so Rollup can convert `ms` to an ES module
            ]
            : [
                strip({
                   include: ['src/m-dot-nav.js'],
                }),
                resolve(), // so Rollup can find `ms`
                commonjs() // so Rollup can convert `ms` to an ES module
            ]
    }
];
