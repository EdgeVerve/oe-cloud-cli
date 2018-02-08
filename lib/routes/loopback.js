/**
 *
 * ©2016-2017 EdgeVerve Systems Limited (a fully owned Infosys subsidiary),
 * Bangalore, India. All Rights Reserved.
 *
 */
'use strict';
const chalk = require('chalk');
const namespaceToName = require('oe-environment').namespaceToName;
// var strongloop = require('strongloop/lib/loader');
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

module.exports = (app, name) => {
    // console.log("app", app, "name", name);
    var self = this;
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
    // invoke loopback generators create loopback
    name = name.replace(/^create:/i, "loopback:")
    process.argv[2] = name;

    // strongloop.createLoader({
    //         manuals: require('path').resolve(__dirname, '..', 'man')
    //     })
    //     .on('error', function(err) {
    //         console.error(err.message);
    //         process.exit(1);
    //     })
    //     .run();

    var opts = nopt({
        help: Boolean,
        version: Boolean,
        generators: Boolean
      }, {
        h: '--help',
        v: '--version',
        l: '--generators'
      });

    var args = process.argv.slice(2);
    debug('invoking slc %s', args.join(' '));
    var envYo = yeoman();

    // Make sure slc loopback is delegated to slc loopback:app (the default
    // subgenerator)
    envYo.alias(/^([^:]+)$/, '$1:app');

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

    // list generators
    if (opts.generators) {
      console.log('Available loopback generators: ');
      console.log(Object.keys(envYo.getGeneratorsMeta()).filter(function(name) {
        return name.indexOf('loopback:') !== -1;
      }).join('\n'));
      return;
    }

    envYo.on('end', function() {
      console.log('Done running loopback generator');
    });

    envYo.on('error', function(err) {
        self.env.error('Error', 'slc ' + args.join(' '), '\n',
        opts.debug ? err.stack : err.message);
      // process.exit(err.code || 1);
    });

    envYo.run(args, opts);

};