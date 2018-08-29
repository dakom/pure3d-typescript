import typescript from 'rollup-plugin-typescript2';
import pkg from './package.json';
import replace from 'rollup-plugin-replace';
import postcss from 'rollup-plugin-postcss';
import string from 'rollup-plugin-string';

export default [
	{
        input: './src/lib/Lib.ts',
        external: ['gl-matrix'],
        output: [
            { file: pkg.module, format: 'es', sourcemap: true },
            { file: pkg.main, format: 'cjs', sourcemap: true }
        ],
        plugins: [
            string({
                // not working....
                include: '**/*.glsl',
            }),
            postcss({
                extensions: [ '.css' ],
            }),
            replace({
                'process.env.NODE_ENV': JSON.stringify( process.env['NODE_ENV'] )
            }),
            typescript({
                tsconfigOverride: {
                    compilerOptions: {
                        declaration: false //will be run as a separate step via tsc which is more thorough
                    }
                },
                useTsconfigDeclarationDir: true,
            })
        ]
	}
];
