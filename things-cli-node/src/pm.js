#!/usr/bin/env node

const program = require('commander');
const header = require('../assets/header');

program
    .on('--help', () => {
        console.log(header.toString());
    })
    .command('bind [credentials]', 'integrate binding credentials')
    .command('things', 'access things service')
    .parse(process.argv);

