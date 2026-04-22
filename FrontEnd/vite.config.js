import { defineConfig } from 'vite'
import { resolve } from 'node:path'

export default defineConfig({
  appType: 'mpa',
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        dashboard: resolve(__dirname, 'src/dashboard.html'),
        accounts: resolve(__dirname, 'src/accounts.html'),
        admin: resolve(__dirname, 'src/admin.html'),
        transaction: resolve(__dirname, 'src/Transaction.html'),
        analytics: resolve(__dirname, 'src/analytics.html'),
      },
    },
  },
})