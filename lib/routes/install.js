/**
 * 
 * ©2016-2017 EdgeVerve Systems Limited (a fully owned Infosys subsidiary),
 * Bangalore, India. All Rights Reserved.
 * 
 */
'use strict';
/* eslint-disable promise/no-callback-in-promise */
const _ = require('lodash');
const async = require('async');
const chalk = require('chalk');
const inquirer = require('inquirer');
const spawn = require('cross-spawn');
const sortOn = require('sort-on');
const figures = require('figures');
const npmKeyword = require('oe-npm-keyword');
const packageJson = require('oe-package-json');
const cliSpinners = require('cli-spinners');
const logUpdate = require('log-update');

const OFFICIAL_GENERATORS = [

];

module.exports = (app, type) => {

  return inquirer.prompt([{
    name: 'searchTerm',
    message: 'Enter keyword to search NPM registry : '
  }]).then(answers => searchNpm(app, answers.searchTerm, type));
};

const generatorMatchTerm = (generator, term) => `${generator.name} ${generator.description}`.indexOf(term) !== -1;


function searchMatchingGenerators(app, term, type, cb) {
  const installedGenerators = app.env.getGeneratorNames();
  const getAllGenerators = _.memoize(() => npmKeyword('oe-'+ type));
  getAllGenerators().then(allGenerators => {
    cb(null, allGenerators.filter(generator => {

      if (installedGenerators.indexOf(generator.name) !== -1) {
        return false;
      }

      return generatorMatchTerm(generator, term);
    }));
  }, cb);
}

function fetchGeneratorInfo(generator, cb) {
  packageJson(generator.name).then(pkg => {
    const official = OFFICIAL_GENERATORS.indexOf(pkg.name) !== -1;
    const mustache = official ? chalk.green(` ${figures.mustache} `) : '';

    cb(null, {
      name: generator.name.replace(/^oe-/, '') + mustache + ' ' + chalk.dim(pkg.description),
      value: generator.name,
      official: -official
    });
  }).catch(cb);
}

function searchNpm(app, term, type) {

  const spinnerSimpleDots = cliSpinners.simpleDots;
  const spinnerPipe = cliSpinners.pipe;
  let pipeFrame = 0;
  let lineFrame = 0;
  const time = Math.max(spinnerSimpleDots.interval , spinnerPipe.interval);

  const searchMessageInterval = setInterval(()=>{
    pipeFrame = (pipeFrame + 1 === spinnerSimpleDots.frames.length) ? 0 : pipeFrame + 1;
    lineFrame = (lineFrame + 1 === spinnerPipe.frames.length) ? 0 : lineFrame + 1;
    logUpdate(`${spinnerPipe.frames[lineFrame]} Searching NPM ${spinnerSimpleDots.frames[pipeFrame]}`);
  },time); 

  const clearMessage = ()=>{
    logUpdate.clear();
    clearInterval(searchMessageInterval);
  }

  const promise = new Promise((resolve, reject) => {
    searchMatchingGenerators(app, term, type, (err, matches) => {
      if (err) {
        clearMessage();
        reject(err);
        return;
      }

      async.map(matches, fetchGeneratorInfo, (err2, choices) => {
        if (err2) {
          clearMessage();
          reject(err2);
          return;
        }
        clearMessage();
        resolve(choices);
      });
    });
  });

  return promise.then(choices => promptInstallOptions(app, sortOn(choices, ['official', 'name'])));
}

function promptInstallOptions(app, choices) {
  let introMessage = 'Sorry, no results matches your search term';

  if (choices.length > 0) {
    introMessage = 'Here\'s what I found. \n  Install one?';
    choices.push(new inquirer.Separator());
  }

  const resultsPrompt = [{
    name: 'toInstall',
    type: 'list',
    message: introMessage,
    choices: choices.concat([{
      name: 'Search again',
      value: 'install'
    }, {
      name: 'Return home',
      value: 'home'
    }])
  }];

  return inquirer.prompt(resultsPrompt).then(answer => {
    if (answer.toInstall === 'home' || answer.toInstall === 'install') {
      return app.navigate(answer.toInstall);
    }

    installGenerator(app, answer.toInstall);
  });
}

function installGenerator(app, pkgName) {

  return spawn('npm', ['install', '--global', pkgName], { stdio: 'inherit' })
    .on('error', err => {
      throw err;
    })
    .on('close', () => {
      console.log(
        '\nI just installed a template by running:\n' +
        chalk.blue.bold('\n    npm install -g ' + pkgName + '\n')
      );

      app.env.lookup(() => {
        app.updateAvailableGenerators();
        app.navigate('home');
      });
    });
}