#!/usr/bin/env node

const program = require('commander');
const ThingsService = require('@bosch-si/things-service-node/things-service');

const C_PATH = __dirname + '/../credentials/credentials.json';
const credentials = require(C_PATH);

const getThings = options => {

    const URL = credentials.default.things.endpoint_http + '/api/2/search/things';
    const client = ThingsService.newHttpClient()
        .eu1()
        .withSolutionBasicAuth(credentials.default.)

};

program
    .command('search')
    .description('search your things')
    .option('-c, --count', 'trim the return')
    .option('-s, --subscription', 'choose on of your bound credentials')
    .action(options => {
        getThings(options);
    });

program
    .parse(process.argv);