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
    );

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
          })
        .then(res => {
            var toSave = res.data;
            toSave.client_id = name;
            toSave.client_secret = secret;
            toSave.scopeForToken = scope;
            bindToken(toSave);
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
    .command('show', 'show your suiteAuth token and credentials')
    .action(() => {
        const token = require(S_PATH);
        console.log(token);
    });

program
    .command('refresh', 'refresh your access_token')
    .action(() => {

        const allToken = require(S_PATH);

        const params = {
            'grant_type': 'refresh_token',
            'client_id': allToken.client_id,
            'client_secret': allToken.client_secret,
            'scope': allToken.scopeForToken,
            'refresh_token': allToken.refresh_token
        };

        axios({
                  method: 'post',
                  url: URL,
                  headers: {
                      'Content-Type': 'application/x-www-form-urlencoded',
                  },
                  data: qs.stringify(params)
              })
            .then(res => {
                var newToken = res.data;
                newToken.client_id = allToken.client_id;
                newToken.client_secret = allToken.client_secret;
                newToken.scopeForToken = allToken.scopeForToken;
                bindToken(newToken);
                console.log(`
              ${chalk.green('SUCCESS')}
              successfully refreshed token.
              `)
            })
            .catch(err => {
                console.log(chalk.red('Something went wrong - please check credentials'));
                throw(err);
            })
    });

program
    .command('unbind', 'delete your token and credentials')
    .action(() => {
        bindToken('{}');
    });

program
    .parse(process.argv);