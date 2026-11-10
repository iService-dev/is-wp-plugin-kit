import { UserConfig, ServerOptions } from "vite";

export interface KitOptions extends UserConfig {
  port?: number;
  outDir?: string;
  /**
   * vite-plugin-static-copy targets. Matched files are copied flat into `dest`
   * unless the target sets an object `rename` (`{ stripBase: 0 }` keeps the folder structure).
   */
  staticCopyTargets?: any;
  cwd?: string;
  server?: ServerOptions & { port?: number };
}

export function wpPluginKitVite(options?: KitOptions): UserConfig;
