import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
    base: '/academic_dashboard/',
    plugins: [react()],
    build: {
        outDir: 'dist'
    }
})
