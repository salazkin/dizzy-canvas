import { terser } from 'rollup-plugin-terser';

export default {
    input: 'src/index.js',
    output: [{
        file: 'dist/dizzy-canvas.js',
        format: 'es',
        sourcemap: true
    }, {
        file: 'dist/dizzy-canvas.min.js',
        format: 'es',
        plugins: [terser()],
        sourcemap: true
    }]
};
