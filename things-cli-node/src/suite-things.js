#!/usr/bin/env node

const program = require('commander');
//const ThingsService = require('@bosch-si/things-service-node/things-service');
const axios = require('axios');
const createAuthHeaderBasic = require(__dirname + '/../utils/utils');
const chalk = require('chalk');

const C_PATH = __dirname + '/../credentials/credentials.json';
const credentials = require(C_PATH);
const qs = require('qs');


program
    .command('search', 'search your things')
    .parse(process.argv);
