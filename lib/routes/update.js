/**
 * 
 * ©2016-2017 EdgeVerve Systems Limited (a fully owned Infosys subsidiary),
 * Bangalore, India. All Rights Reserved.
 * 
 */
'use strict';
const chalk = require('chalk');
const inquirer = require('inquirer');
const spawn = require('cross-spawn');

const successMsg = 'I\'ve just updated your packages. Remember, you can update\na specific package with npm by running:\n' +
  chalk.magenta('\n    npm install -g oe-<package_name>');

function updateSuccess(app) {
  console.log(`\n${chalk.cyan(successMsg)}\n`);
  app.env.lookup(() => {
    app.updateAvailableGenerators();
    app.navigate('home');
  });
}

function updateGenerators(app, pkgs) {
  spawn('npm', ['install', '--global'].concat(pkgs), {stdio: 'inherit'})
    .on('close', updateSuccess.bind(null, app));
}

module.exports = app => {

  return inquirer.prompt([{
    name: 'generators',
    message: 'Packages to update',
    type: 'checkbox',
    validate(input) {
      return input.length > 0 ? true : 'Please select at least one package to update.';
    },
    choices: Object.keys(app.generators || {}).map(key => {
      return {
        name: app.generators[key].name,
        checked: true
      };
    })
  }]).then(answer => {
    updateGenerators(app, answer.generators);
  });
};