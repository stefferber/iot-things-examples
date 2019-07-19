const chalk = require('chalk');

const returnValidOrThrow = creds => {
    try {
        JSON.parse(creds)
    } catch (e) {
        console.log(chalk.red('[ERROR] - Invalid JSON.'))
        throw(e);
    }
    return JSON.parse(creds);
}

module.exports = returnValidOrThrow;
