export function createLogger(moduleName) {
  return {
    info: (...args) => console.log(`[INFO][${moduleName}]`, ...args),
    warn: (...args) => console.warn(`[WARN][${moduleName}]`, ...args),
    error: (...args) => console.error(`[ERROR][${moduleName}]`, ...args),
    success: (...args) => console.log(`[SUCCESS][${moduleName}]`, ...args),
  };
}

