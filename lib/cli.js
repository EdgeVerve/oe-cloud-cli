#!/usr/bin/env node

/**
 *
 * ©2016-2017 EdgeVerve Systems Limited (a fully owned Infosys subsidiary),
 * Bangalore, India. All Rights Reserved.
 *
 */

'use strict';
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const stringLength = require('string-length');
const meow = require('meow');
const list = require('cli-list');
const pkg = require('../package.json');
const Router = require('./router');

const gens = list(process.argv.slice(2));

const cli = gens.map(gen => {
  const minicli = meow({help: false, pkg, argv: gen});
  const opts = minicli.flags;
  const args = minicli.input;

  // Add un-camelized options too, for legacy
  // TODO: Remove some time in the future when generators have upgraded
  Object.keys(opts).forEach(key => {
    const legacyKey = key.replace(/[A-Z]/g, m => `-${m.toLowerCase()}`);
    opts[legacyKey] = opts[key];
  });

  return {opts, args};
});

// cli is an array of options and arguments with opts having camelCase keys

const firstCmd = cli[0] || {opts: {}, args: {}};
const cmd = firstCmd.args[0];

function createGeneratorList(env) {
  const generators = Object.keys(env.getGeneratorsMeta()).reduce((namesByGenerator, generator) => {
    const parts = generator.split(':');
    const generatorName = parts.shift();

    // If first time we found this generator, prepare to save all its sub-generators
    if (!namesByGenerator[generatorName]) {
      namesByGenerator[generatorName] = [];
    }

    // If sub-generator (!== app), save it
    if (parts[0] !== 'app') {
      namesByGenerator[generatorName].push(parts.join(':'));
    }

    return namesByGenerator;
  }, {});

  if (Object.keys(generators).length === 0) {
    return '  Couldn\'t find any generators, did you install any?';
  }

  return Object.keys(generators).map(generator => {
    const subGenerators = generators[generator].map(subGenerator => `    ${subGenerator}`).join('\n');
    return `  ${generator}\n${subGenerators}`;
  }).join('\n');
}

function init() {
  const env = require('oe-environment').createEnv();

  env.on('error', err => {
    console.error('Error:', process.argv.slice(2).join(' '), '\n');
    console.error(firstCmd.opts.debug ? err.stack : err.message);
    process.exit(err.code || 1);
  });

  // Lookup for every namespaces, within the environments.paths and lookups
  env.lookup(() => {
    const generatorList = createGeneratorList(env);

    // List generators
    if (firstCmd.opts.generators) {
      console.log('Available Generators:\n\n' + generatorList);
      return;
    }

    // Start the interactive UI if no generator is passed
    if (!cmd || cmd === "create" || cmd === "define" || cmd === "attach") {
      if (firstCmd.opts.help) {
        const usageText = fs.readFileSync(path.join(__dirname, 'usage.txt'), 'utf8');
        console.log(`${usageText}`);
        return;
      }

      runOe(env, firstCmd.args);
      return;
    }

    // Note: at some point, nopt needs to know about the generator options, the
    // one that will be triggered by the below args. Maybe the nopt parsing
    // should be done internally, from the args.
    for (const gen of cli) {
      env.run(gen.args, gen.opts);
    }
  });
}

function runOe(env, commandArgs) {
  const router = new Router(env);
  router.registerRoute('help', require('./routes/help'));
  router.registerRoute('update', require('./routes/update'));
  router.registerRoute('run', require('./routes/run'));
  router.registerRoute('install', require('./routes/install'));
  router.registerRoute('exit', require('./routes/exit'));
  router.registerRoute('clearConfig', require('./routes/clear-config'));
  router.registerRoute('home', require('./routes/home'));
  router.registerRoute('packages', require('./routes/packages'));
  router.registerRoute('create', require('./routes/loopback'));
  router.registerRoute('generate', require('./routes/generate'));

  process.once('exit', router.navigate.bind(router, 'exit'));

  router.updateAvailableGenerators();
  if (commandArgs && commandArgs[0] === "create") {
    router.navigate("create", commandArgs);
  }else if (commandArgs && (commandArgs[0] === "define" || commandArgs[0] === "attach")) {
    router.navigate("generate", commandArgs);
  } else {
    router.navigate('home');
  }
}

init();