const { createLogger, format, transports } = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const { combine, printf, timestamp } = format;
const path = require('path');

const env = process.env.NODE_ENV

const loggerDev = createLogger({
    level: 'debug',
    format: combine(
        timestamp({
            format: 'YYYY-MM-DD HH:mm:ss'
        }),
        format.errors({ stack: true }),
        // printf((params) => {
        //     return console_format(params)
        // }),
    ),
    transports: [
        new transports.Console({
            silent: false,
            level: 'debug',
            format: combine(
                printf((params) => file_format(params)),
            )
        }),
    ]
});

const loggerProd = createLogger({
    level: 'info',
    format: combine(
        timestamp({
            format: 'YYYY-MM-DD HH:mm:ss'
        }),
        format.errors({ stack: true }),
        printf((params) => console_format(params)),
    ),
    transports: [
        new DailyRotateFile({
            level: 'info',
            filename: path.join(__dirname, '../log', 'winston', `%DATE%.log`),
            datePattern: 'YYYY-MM-DD',
            maxFiles: '7d'
        }),
    ]
});

function file_format(params) {
    const { level, message, timestamp } = params
    let msg = timestamp + " "
    if (level === 'error') { msg += `error: ` }
    if (Array.isArray(message)) {
        msg += JSON.stringify(message) + " "
    }
    else if (typeof message === 'object') {
        msg += JSON.stringify(message) + " "
    }
    else {
        msg += message + " "
    }
    if (params[Symbol.for('splat')]) {
        let vMsg = params[Symbol.for('splat')]
        vMsg.map(value => {
            if (Array.isArray(value)) {
                msg += JSON.stringify(value) + " "
            }
            else if (typeof value === 'object') {
                msg += JSON.stringify(value) + " "
            } else {
                msg += value + " "
            }
        })
    }
    return msg
}
function console_format(params) {
    const { level, message, timestamp } = params
    let msg = timestamp + " "
    /**
    |---------------------------------
    | Format level
    |---------------------------------
    */
    // msg += level_format(level, message)
    /**
    |---------------------------------
    | message
    |---------------------------------
    */
    if (Array.isArray(message)) {
        msg += JSON.stringify(message) + " "
    }
    else if (typeof message === 'object') {
        msg += JSON.stringify(message) + " "
    }
    else {
        msg += message + " "
    }
    if (params[Symbol.for('splat')]) {
        let vMsg = params[Symbol.for('splat')]
        vMsg.map(value => {
            if (Array.isArray(value)) {
                msg += JSON.stringify(value) + " "
            }
            else if (typeof value === 'object') {
                msg += JSON.stringify(value) + " "
            } else {
                msg += value + " "
            }

        })
    }
    return msg
}
function level_format(level, msg) {
    if (level === 'error') { msg += `\u001b[31merror\u001b[39m: ` }
    if (level === 'warn') { msg += `\u001b[33mwarn\u001b[39m: ` }
    if (level === 'info') { msg += `\u001b[32minfo\u001b[39m: ` }
    if (level === 'verbose') { msg += `\u001b[35mverbose\u001b[39m: ` }
    if (level === 'debug') { msg += `\u001b[36mdebug\u001b[39m: ` }
    if (level === 'silly') { msg += `\u001b[34msilly\u001b[39m: ` }

    return msg
}

module.exports = env === 'production' ? loggerProd : loggerDev