import esbuild from 'esbuild';
import postcssPlugin from 'esbuild-plugin-postcss';
import { readFileSync } from 'fs';

const isWatch = process.argv.includes('--watch');

const config = {
  entryPoints: ['src/index.jsx'],
  bundle: true,
  outfile: 'dist/bundle.js',
  minify: !isWatch,
  sourcemap: isWatch,
  target: ['es2020'],
  loader: {
    '.js': 'jsx',
    '.jsx': 'jsx',
    '.ts': 'tsx',
    '.tsx': 'tsx',
    '.png': 'dataurl',
    '.jpg': 'dataurl',
    '.svg': 'dataurl',
  },
  plugins: [
    postcssPlugin({
      plugins: [],
    }),
  ],
  define: {
    'process.env.NODE_ENV': isWatch ? '"development"' : '"production"',
  },
};

if (isWatch) {
  const ctx = await esbuild.context(config);
  await ctx.watch();
  console.log('Watching for changes...');
} else {
  await esbuild.build(config);
  console.log('Build completed successfully!');
}
