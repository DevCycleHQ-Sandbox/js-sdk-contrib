/**
 * Configuration options for flagd-core.
 */
export interface FlagdCoreOptions {
  /**
   * Enable Workers compatibility mode.
   * 
   * When true:
   * - Uses interpreter mode for JSONLogic evaluation instead of compilation
   * - This avoids `new Function()` which is blocked in Cloudflare Workers
   * 
   * Trade-off: Interpreter mode is ~10-20x slower per evaluation, but this
   * is usually negligible for typical use cases (a few flag evaluations per request).
   * 
   * @default false
   */
  workers?: boolean;
}
