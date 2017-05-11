/**
 * 
 * ©2016-2017 EdgeVerve Systems Limited (a fully owned Infosys subsidiary),
 * Bangalore, India. All Rights Reserved.
 * 
 */
'use strict';
const chalk = require('chalk');
const namespaceToName = require('oe-environment').namespaceToName;

module.exports = (app, name) => {
  const baseName = namespaceToName(name);

  console.log(
    chalk.yellow('\nMake sure you are in the directory you want to scaffold into.') +
    chalk.dim('\nThis package can also be run with: ') +
    chalk.blue(`oe ${baseName}\n`)
  );

  // Save the generator run count
  const generatorRunCount = app.conf.get('generatorRunCount');
  generatorRunCount[baseName] = generatorRunCount[baseName] + 1 || 1;
  app.conf.set('generatorRunCount', generatorRunCount);
  app.env.run(name);
};