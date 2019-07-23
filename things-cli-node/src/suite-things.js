#!/usr/bin/env node

const program = require('commander');
//const ThingsService = require('@bosch-si/things-service-node/things-service');
const axios = require('axios');
const createAuthHeaderBasic = require(__dirname + '/../utils/utils');
const chalk = require('chalk');

const C_PATH = __dirname + '/../credentials/credentials.json';
const credentials = require(C_PATH);
const qs = require('qs');

const getThings = (count, subscription, authentication) => {


    // TODO get suiteAuthToken -> set it as Header.
    // Maybe try first access -> if err -> refresh

    var access = '';
    // Default: SuiteAuth Bearer Token
    if (!authentication) {
        const suiteAuth = require(__dirname + ('/../credentials/suiteauth.json'))
        access = 'Bearer ' + suiteAuth.access;
    } else {
        access = 'Junger Vadder';
    }

    const profile = subscription || 'default';
    const appendCount = count ? '/count' + count : '';

    console.log(chalk.red(JSON.stringify(profile)))

    axios.get(
        credentials[profile].things[endpoint_http] + '/api/2/search/things' + appendCount,
        {
            headers: {
                'Authorization': access
            }
        }
    ).then(res => {
        console.log(JSON.parse(res, null, 2));
    }).catch(err => { throw(err)} );


};

program
    .command('search [options]')
    .description('search your things')
    .action(cmd => {
        console.log('command: ', cmd);
    })

program
    .option('-c, --count', 'trim amount fo things')
    .option('-s, --subscription', 'choose on of your bound credentials')
    .option('-a, --authentication', '[suiteAuth|todo..]')
    .action( options => {

        console.log(options.count, options.subscription, options.authentication)

        // console.log('options: ', count, subscription, authentication)

        // console.log(count, subscription, authentication);

        // getThings(count, subscription, authentication);
    });

program
    .parse(process.argv);