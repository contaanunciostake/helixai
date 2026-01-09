/**
 * Logger simples para o bot
 */

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
};

export function createLogger(module = 'APP') {
  const prefix = `[${module}]`;

  return {
    info: (...args) => {
      console.log(`${colors.cyan}ℹ️  ${prefix}${colors.reset}`, ...args);
    },

    success: (...args) => {
      console.log(`${colors.green}✅ ${prefix}${colors.reset}`, ...args);
    },

    error: (...args) => {
      console.error(`${colors.red}❌ ${prefix}${colors.reset}`, ...args);
    },

    warning: (...args) => {
      console.warn(`${colors.yellow}⚠️  ${prefix}${colors.reset}`, ...args);
    },

    debug: (...args) => {
      console.log(`${colors.dim}🔍 ${prefix}${colors.reset}`, ...args);
    },

    function: (...args) => {
      console.log(`${colors.magenta}⚙️  ${prefix}${colors.reset}`, ...args);
    }
  };
}

export default createLogger;
