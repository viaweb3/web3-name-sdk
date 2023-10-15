import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts', 'src/injName.ts', 'src/seiName.ts', 'src/solName.ts'],
})
