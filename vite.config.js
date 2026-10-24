import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: './', // Osigurava da se CSS i JS učitavaju sa relativnih putanja
  css: {
    transformer: 'lightningcss', // Tailwind v4 koristi lightningcss za brzi build
  }
})