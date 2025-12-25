import { defineConfig } from 'vite'
import { tanstackRouter } from '@tanstack/router-plugin/vite'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    tanstackRouter({
      routesDirectory: './src/routes', // corrected option name
      generatedRouteTree: './src/routeTree.gen.ts',
    }),
    tailwindcss(),
  ],
})