import { UserConfig, ServerOptions } from "vite";

export interface KitOptions extends UserConfig {
  port?: number;
  outDir?: string;
  staticCopyTargets?: any;
  cwd?: string;
  server?: ServerOptions & { port?: number };
}

export function wpPluginKitVite(options?: KitOptions): UserConfig;
