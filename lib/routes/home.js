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
const globalConfigHasContent = require('../utils/global-config').hasContent;
const util = require('util');
require('../utils/print-logo');

module.exports = app => {

  const defaultChoices = [
    {
      name: 'Find some help',
      value: 'help'
    }, {
      name: 'Search/Build a Starter App',
      value: {
        method: 'package',
        type: 'starter'
      }
    }, {
      name: 'Search/Experience a Concept',
      value: {
        method: 'package',
        type: 'concept'
      }
    }, {
      name: 'Create a datasource',
      value: {
        method: 'create:datasource',
        type: ['create', 'datasource']
      }
    }, {
      name: 'Create a model',
      value: {
        method: 'create:model',
        type: ['create', 'model']
      }
    }, {
      name: 'Add a property',
      value: {
        method: 'create:property',
        type: ['create', 'property']
      }
    }, {
      name: 'Add an ACL',
      value: {
        method: 'create:acl',
        type: ['create', 'acl']
      }
    }, {
      name: 'Create a relation',
      value: {
        method: 'create:relation',
        type: ['create', 'relation']
      }
    }, {
      name: 'Add a middleware',
      value: {
        method: 'create:middleware',
        type: ['create', 'middleware']
      }
    }, {
      name: 'Generate default UI for model',
      value: {
        method: 'define:default-ui',
        type: ['define','default-ui']
      }
    }, {
      name: 'Generate UIRoute',
      value: {
        method: 'define:ui-route',
        type: ['define','ui-route']
      }
    }, {
      name: 'Generate Navigation Link',
      value: {
        method: 'define:navigation-link',
        type: ['define','navigation-link']
      }
    }, {
      name: 'Attach workflow to model',
      value: {
        method: 'attach:workflow',
        type: ['attach','workflow']
      }
    }, {
      name: 'Attach rule to model',
      value: {
        method: 'attach:business-rules',
        type: ['attach','business-rules']
      }
    }, {
      name: 'Exit!',
      value: 'exit'
    }];

  if (globalConfigHasContent()) {
    defaultChoices.splice(defaultChoices.length - 1, 0, {
      name: 'Clear global config',
      value: 'clearConfig'
    });
  }

  return fullname().then(name => {
    const userName = name ? `'Hello ${name.split(' ')[0]}! ` : '\'Hello! ';

    return inquirer.prompt([{
      name: 'whatNext',
      type: 'list',
      message: `${userName}What would you like to do?`,
      choices: _.flatten([
        defaultChoices
      ])
    }]).then(answer => {
      // console.log(util.inspect(answer));
      if (answer.whatNext.method === 'run') {
        app.navigate('run', answer.whatNext.generator);
        return;
      }
      if (answer.whatNext.method === 'package') {
        app.navigate('packages', answer.whatNext.type);
        return;
      }
      if (answer.whatNext.method === 'create:datasource') {
        app.navigate('create', answer.whatNext.type);
        return;
      }
      if (answer.whatNext.method === 'create:model') {
        app.navigate('create', answer.whatNext.type);
        return;
      }
      if (answer.whatNext.method === 'create:property') {
        app.navigate('create', answer.whatNext.type);
        return;
      }
      if (answer.whatNext.method === 'create:acl') {
        app.navigate('create', answer.whatNext.type);
        return;
      }
      if (answer.whatNext.method === 'create:relation') {
        app.navigate('create', answer.whatNext.type);
        return;
      }
      if (answer.whatNext.method === 'create:middleware') {
        app.navigate('create', answer.whatNext.type);
        return;
      }
      switch (answer.whatNext.method) {
        case 'define:default-ui':
        case 'define:ui-route':
        case 'define:navigation-link':
        case 'attach:workflow':
        case 'attach:business-rules':app.navigate('generate', answer.whatNext.type);return;break;
        default:break;
      }


      if (answer.whatNext === 'exit') {
        return;
      }

      app.navigate(answer.whatNext);
    });
  });
};