const fs = require('fs');
const Log = require('../models/Log')

class Logger {    
    
    async log(message, data=null) {
        try{
            const logger = new Log({
                message: message,
                data: data
            })

            await logger.save();
            console.log({ message: message, data: data })
        }
        catch(e) {
            console.log(e.message)
        }
    }
}

module.exports = Logger;