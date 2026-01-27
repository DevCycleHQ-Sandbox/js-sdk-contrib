// Type declarations for modules without types

declare module 'object-hash' {
  export function sha1(object: unknown): string;
}

// Allow require() for dynamic imports
declare const require: NodeRequire;
