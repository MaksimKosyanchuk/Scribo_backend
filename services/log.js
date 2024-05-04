const fs = require('fs');

class Logger {
    constructor() {
        this._create_directory()
    }
    
    _create_directory() {
        const log_directory = "./log"

        if (!fs.existsSync(log_directory)) {
            fs.mkdirSync(log_directory)
        }
        const date_directory = log_directory + "/" + `${new Date().toLocaleDateString().replace(/\//g, '.')}`;
        if(!fs.existsSync(date_directory)) {
            fs.mkdirSync(date_directory)
        }

        this.session_directory = date_directory + "/" + new Date().toLocaleTimeString().replace(/:/g, '-') + ".log"
        
        try {
            fs.writeFileSync(this.session_directory, "");
        } catch (err) {
            console.error('Error:', err);
        }
    }

    log(message) {
        const text = `[${new Date().toLocaleDateString()} | ${new Date().toLocaleTimeString()}] ${message}\n`
        try {
            fs.appendFileSync(this.session_directory, text);
        } catch (err) {
            console.error('Error:', err);
        }
    }

    log_JSON(object) {
        this.log(JSON.stringify(object))
    }
}

module.exports = Logger;