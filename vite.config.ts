// vite.config.ts
import { defineConfig } from 'vite'

export default defineConfig({
   base: '/repo-name/', // замени на имя своего репозитория
   build: {
      outDir: 'dist', // папка с готовым сайтом
   },
})

