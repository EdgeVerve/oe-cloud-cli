/**
 * 
 * ©2016-2017 EdgeVerve Systems Limited (a fully owned Infosys subsidiary),
 * Bangalore, India. All Rights Reserved.
 * 
 */
'use strict';
const inquirer = require('inquirer');
const opn = require('opn');

module.exports = app => {

  return inquirer.prompt([{
    name: 'whereTo',
    type: 'list',
    message: 'Here are a few helpful resources.\n\nI will open the link you select in your browser for you',
    choices: [{
      name: 'Take me to the repo',
      value: 'https://github.com/EdgeVerve/oe-cloud'
    },{
      name: 'Take me back home!',
      value: 'home'
    }]
  }]).then(answer => {

    if (answer.whereTo === 'home') {
      console.log('I get it, you like learning on your own. I respect that.');
      app.navigate('home');
      return;
    }

    opn(answer.whereTo);
  });
};