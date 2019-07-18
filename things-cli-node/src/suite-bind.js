#!/usr/bin/env node

'use strict';
const program = require('commander');
const fs = require('fs');
const chalk = require('chalk');
const C_PATH = __dirname + '/../credentials/credentials.json';
const returnValidOrThrow = require(__dirname + '/../utils/utils.js');
var existing = require(C_PATH);

const bindCredentials = (credentials, options) => {
    const parsed = returnValidOrThrow(credentials);
    if (options.subscription) {
        if (existing[options.subscription]) {
            console.log('Overwrite key ', chalk.yellow(options.subscription))
        } else {
            console.log('Adding subscription with key', chalk.green(options.subscription))
        }
        existing[options.subscription] = parsed;
    } else {
        existing['default'] = parsed;
    }
    try {
        fs.writeFileSync(C_PATH, JSON.stringify(existing, null, 2));
    } catch (e) {
        throw e;
    }
    console.log(chalk.green('Successfully added credentials'));
};

program
    .option('-s --subscription <name>', 'pass an identifier to manage credentials by identifier')
    .action(function(credentials, options) {
        bindCredentials(credentials, options);
    })
    .parse(process.argv);


