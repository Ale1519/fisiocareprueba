// @ts-ignore
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    outDir: 'dist',
  },
  // Al usar rutas relativas estándar en Vite, no necesitamos configurar alias complejos para el MVP
});