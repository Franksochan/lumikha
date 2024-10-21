const { createLogger, format, transports } = require('winston')
const { combine, timestamp, printf, colorize } = format

// Define custom log colors
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'blue',
  debug: 'cyan',
  verbose: 'magenta',
  silly: 'grey'
}

// Apply custom colors to winston
require('winston').addColors(colors)

// Define log format
const logFormat = printf(({ level, message, timestamp }) => {
  return `${timestamp} [${level.toUpperCase()}]: ${message}`
})

// Create the logger
const logger = createLogger({
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    logFormat
  ),
  transports: [
    new transports.Console({
      format: combine(
        colorize({
          all: true,
          colors: colors // Apply custom colors
        }),
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      ),
    }),
    new transports.File({ filename: 'logs/error.log', level: 'error' }),
    new transports.File({ filename: 'logs/combined.log' }),
  ],
})

module.exports = logger
