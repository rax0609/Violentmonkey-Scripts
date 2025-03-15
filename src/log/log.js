// log.js

window.w3AutoHelper.logger = (function() {
    class Logger {
        constructor() {
            this.logLevel = {
                ERROR: 4,
                WARN: 3,
                INFO: 2,
                DEBUG: 1
            };
            this.currentLevel = this.logLevel.INFO; // 預設等級
        }

        setLevel(level) {
            this.currentLevel = this.logLevel[level];
        }

        error(message, ...args) {
            this._log('ERROR', message, ...args);
        }

        warn(message, ...args) {
            this._log('WARN', message, ...args);
        }

        info(message, ...args) {
            this._log('INFO', message, ...args);
        }

        debug(message, ...args) {
            this._log('DEBUG', message, ...args);
        }

        _log(level, message, ...args) {
            if (this.logLevel[level] >= this.currentLevel) {
                const timestamp = new Date().toISOString();
                console.log(`[${timestamp}] [${level}] ${message}`, ...args);
            }
        }
    }
    
    return new Logger();
})();