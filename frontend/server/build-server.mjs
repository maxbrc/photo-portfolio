import { build } from 'esbuild';
import { nodeExternalsPlugin } from 'esbuild-node-externals';

await build({
  entryPoints: ['./server/src/index.tsx'],
  bundle: true,
  platform: 'node',
  format: 'esm',
  outfile: './server/dist/index.js',
  jsx: 'automatic',
  loader: { '.css': 'empty' },
  plugins: [nodeExternalsPlugin()],
});