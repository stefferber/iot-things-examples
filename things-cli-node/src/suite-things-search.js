#!/usr/bin/env node

const program = require('commander');
const axios = require('axios');
const chalk = require('chalk');

const S_PATH = __dirname + '/../credentials/suiteauth.json';
const C_PATH = __dirname + '/../credentials/credentials.json';

program
    .option('-c, --count [number]', 'trim amount of things', '')
    .option('-s, --subscription [identifier]', 'choose on of your bound credentials', 'default')
    .option('-a, --authentication [identifier]', '[suiteAuth|todo..]', 'suiteAuth')

program
    .parse(process.argv);

const executeSearch = (c, s, a) => {

    var access = '';
    // Default: SuiteAuth Bearer Token
    if (a === 'suiteAuth') {
        const suiteAuth = require(S_PATH);
        if (suiteAuth.access_token === undefined) {
            console.log(`
            ${chalk.red('ERROR')}
            Error loading access token. Bind suiteAuth authentication first.
            Usage:
            suite auth bind [options]
            `);
            process.exit(1);
        }
        access = 'Bearer ' + suiteAuth.access_token;
    } else {
        console.log(`
            ${chalk.red('UNSUPPORTED')}
            In version 0.1.0 only suiteAuth for authentication is supported.
            We are working on it...
            `);
        process.exit(1);
    }

    const profile = s || 'default';
    const appendCount = c !== '' ? '/count' + c : '';

    const credentials = require(C_PATH);

    let URL = credentials[profile].things['endpoint_http'] + '/api/2/search/things' + appendCount;


    console.log(URL);

    URL = URL.replace('https', 'http');

    console.log(URL);

    axios.get(URL, {
        headers: {
            Authorization: access,
            'accept': 'application/json'
        }
    })
        .then(res => {
            console.log(JSON.parse(res, null, 2));
        })
        .catch(err => {
            console.log(err);
        });
};

executeSearch(program.count, program.subscription, program.authentication);
