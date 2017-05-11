/**
 * 
 * ©2016-2017 EdgeVerve Systems Limited (a fully owned Infosys subsidiary),
 * Bangalore, India. All Rights Reserved.
 * 
 */
'use strict';
const _ = require('lodash');
const chalk = require('chalk');
const fullname = require('fullname');
const inquirer = require('inquirer');
const namespaceToName = require('oe-environment').namespaceToName;
const util = require('util');

const OFFICIAL_GENERATORS = [];

module.exports = (app, type) => {
  const qualifiedname = type === 'starter' ? 'starter app' : 'concept';
  const defaultChoices = [
    {
      name: 'Install a new ' + qualifiedname,
      value: {
        method: 'install',
        type: type
      }
    }, {
      name: 'Home',
      value: 'home'
    }];

  const generatorList = _.chain(app.generators).map(generator => {
    if (!generator.appGenerator || generator.keywords.indexOf("oe-" + type) === -1) {
      return null;
    }

    const updateInfo = generator.updateAvailable ? chalk.dim.yellow(' ♥ Update Available!') : '';

    return {
      name: generator.prettyName + updateInfo,
      value: {
        method: 'run',
        generator: generator.namespace
      }
    };
  }).compact().sortBy(el => {
    const generatorName = namespaceToName(el.value.generator);
    return -app.conf.get('generatorRunCount')[generatorName] || 0;
  }).value();

  if (generatorList.length > 0) {
    defaultChoices.unshift({
      name: 'Update your packages',
      value: 'update'
    });
  }

  return inquirer.prompt([{
    name: 'whatNext',
    type: 'list',
    message: `What would you like to do?`,
    choices: _.flatten([
      new inquirer.Separator('Installed ' + qualifiedname + 's'),
      generatorList,
      new inquirer.Separator(),
      defaultChoices,
      new inquirer.Separator()
    ])
  }]).then(answer => {
    if (answer.whatNext.method === 'run') {
      app.navigate('run', answer.whatNext.generator);
      return;
    }
    if (answer.whatNext.method === 'install') {
      app.navigate('install', answer.whatNext.type);
      return;
    }

    app.navigate(answer.whatNext);
  });
};