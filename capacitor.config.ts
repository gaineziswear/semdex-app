import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'mu.semdex.app',
  appName: 'SEMDEX',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
