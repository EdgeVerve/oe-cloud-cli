/**
 *
 * ©2016-2017 EdgeVerve Systems Limited (a fully owned Infosys subsidiary),
 * Bangalore, India. All Rights Reserved.
 *
 */
'use strict';
const chalk = require('chalk');
var nopt = require('nopt');
var path = require('path');
var lbGenerator = require('generator-loopback');
var debug = require('debug')('oe:create');

var yeoman = lbGenerator._yeoman; // generator-loopback should export _yeoman
if (!yeoman) {
  try {
    // Try to use the yeoman-generator from generator-loopback module
    yeoman = require('generator-loopback/node_modules/yeoman-generator');
  } catch (err) {
    // Fall back the peer/parent dep
    yeoman = require('yeoman-generator');
  }
}

var commands = ["datasource", "model", "property", "acl", "relation", "middleware"];

module.exports = (app, name) => {
    debug("name: ", name);

    if (commands.indexOf(name[1]) === -1) {
      app.env.error(chalk.red(name[1] + ' is not a valid create command.\n') +
       chalk.yellow('Available options are ' + commands.join(', ') + '.\n'));
      return;
    }

    console.log(chalk.yellow('\nMake sure you are in the scaffolded project directory'));

    var mainCmds = process.argv.slice(0, 2);
    var lbCmd = "loopback:" + name[1];
    var args = [lbCmd];
    args = args.concat(name.slice(2));
    process.argv = mainCmds.concat(args);

    var opts = nopt({
      help: Boolean,
      version: Boolean,
      generators: Boolean
    }, {
      h: '--help',
      v: '--version',
      l: '--generators'
    });

    debug('invoking slc %s', args.join(' '));
    // var envYo = yeoman();
    const yeomanEnv = lbGenerator._yeomanEnv;
    const envYo = yeomanEnv.createEnv();

    // Change the working directory to the generator-loopback module so that
    // yoeman can discover the generators
    var root = path.dirname(require.resolve('generator-loopback/package.json'));
    var cwd = process.cwd();
    debug('changing directory to %s', root);
    process.chdir(root);

    // lookup for every namespaces, within the environments.paths and lookups
    envYo.lookup();
    debug('changing directory back to %s', cwd);
    process.chdir(cwd); // Switch back

    envYo.on('end', function() {
      console.log('Done running loopback generator');
    });

    envYo.on('error', function(err) {
      app.env.error('Error', 'slc ' + args.join(' '), '\n',
      opts.debug ? err.stack : err.message);
      // process.exit(err.code || 1);
    });

    envYo.run(args);
};