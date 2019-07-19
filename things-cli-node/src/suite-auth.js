#!/usr/bin/env node

const program = require('commander');
const axios = require('axios');
const chalk = require('chalk');
const fs = require('fs');

const S_PATH = __dirname + '/../credentials/suiteauth.json';
const qs = require('qs');
const URL = 'https://access.bosch-iot-suite.com/token';

const bindToken = tokenJson => {
    const parsed = JSON.parse(
        JSON.stringify(tokenJson)
    )
    try {
        fs.writeFileSync(S_PATH, JSON.stringify(parsed, null, 2));
    } catch (e) {
        throw e;
    }
};

const getToken = (name, secret, scope) => {
    const params = {
        'grant_type': 'client_credentials',
        'client_id': name,
        'client_secret': secret,
        'scope': scope
    };

    axios({
              method: 'post',
              url: URL,
              headers: {
                  'Content-Type': 'application/x-www-form-urlencoded'
              },
              data: qs.stringify(params)
          }).then(res => {
              bindToken(res.data);
              console.log(`
              ${chalk.green('SUCCESS')}
              successfully bound suiteAuth to suite-cli.
              `)
    })
        .catch(err => {
            console.log(chalk.red('Something went wrong - please check credentials'));
            throw(err);
        })
};

program
    .command('bind')
    .description('bind suite-cli to suite auth')
    .option('-c, --clientid', 'your client id')
    .option('-p, --clientsecret', 'your client secret')
    .option('-s, --scope', 'scope of your suiteAuth token')
    .action((clientid, clientsecret, scope) => {

        console.log('options: ', clientid, clientsecret, scope);

        if (clientid && clientsecret && scope) {
            getToken(clientid, clientsecret, scope);
        } else {
            console.log(`For suiteAuth, all
            ${chalk.red('clientid')},
            ${chalk.red('clientsecret')}
            and ${chalk.red(
                'scope')} is required`);
        }
    });

program
    .parse(process.argv);