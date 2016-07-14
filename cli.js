#! /usr/bin/env node

'use strict';

const p = require('path');
const fs = require('fs-extra');
const program = require('commander');
const ejs = require('ejs');
const exists = require('file-exists');
const pkg = require('./package.json');
const log = require('./lib/log.js');

const inputExt = '.ejs';
const outputExt = '.html';

let options = {};

program
  .version(pkg.version)
  .arguments('<config> [dest]')
  .option('-r, --read <variable_name>', 'Read contents from stdin, if available, and pipe to a given global variable name in the config.')
  .action((config, dest) => {
    options.config = config;
    options.dest = dest;
  });

program.parse(process.argv);

if (!options.config) {
  return log.error('A path to a config file must be declared.');
}

if (!exists(options.config)) {
  return log.error(`Config path does not exist: ${options.config}`);
}

const config = require(p.resolve(process.cwd(), options.config));

if (!config.files || !config.files.length) {
  return log.error(`No files have been declared in ${options.config}`)
}

if (!!program.read) {
  process.stdin
    .setEncoding('utf8')
    .on('readable', () => {
      let chunk = process.stdin.read();

      config.globals[program.read] = config.globals[program.read] || '';

      if (chunk !== null) {
        config.globals[program.read] = [config.globals[program.read], chunk].join('');
      } else {
        run();
        process.stdin.emit('end');
      }
    });
} else {
  run();
}

/////////////////

/**
 * Transforms the declared "include" paths in the template
 * to make sure they are relative to the entry layout.
 *
 * @param  {String} data       The raw template string
 * @param  {Object} fileConfig A config object that includes a template, path, and locals
 * @return {String}            The transformed template string
 */
function fixIncludePaths(data, fileConfig) {
  const pattern = /include\s?\(['"]([\w/]+)['"]/g;

  if (!data.match(pattern)) {
    return data;
  }

  return data.replace(pattern, (str, p1, offset, s) => {
    return `include('${p.join(p.dirname(options.config), p1)}'`;
  });
}

/**
 * Retrieves the data that should be passed into the ejs template
 * @param  {Object} fileConfig A config object that includes a template, path, and locals
 */
function getData(fileConfig) {
  fileConfig.globals = fileConfig.globals || {};
  fileConfig.locals = fileConfig.locals || {};

  return Object.assign({}, config.globals, fileConfig.locals);
}

/**
 * Returns a filename ensuring that the extnsion is included
 * @param  {String} filename A filename
 * @param  {String} ext      The desired extension
 * @return {String}          The new filename
 */
function ensureExt(filename, ext) {
  if (p.extname(filename) !== ext) {
    return [filename, ext].join('');
  } else {
    return filename;
  }
}

/**
 * Handles what to do with the rendered HTML.
 * @param  {Object} fileConfig A config object that includes a template, dest, and locals
 * @param  {String} template   The template data
 */
function handleOut(fileConfig, template) {
  const ejsSettings = {
    filename: "."
  };

  let rendered = ejs.render(template, getData(fileConfig), ejsSettings);

  if (!fileConfig.dest) {
    return process.stdout.write(rendered);
  }

  options.dest = options.dest || '.';

  let dest = p.resolve(options.dest, ensureExt(fileConfig.dest, outputExt));

  fs.ensureDir(p.dirname(dest), (err) => {
    if (err) {
      return log.error(err);
    }

    fs.writeFile(dest, rendered, (err) => {
      if (err) {
        return log.error(err);
      }
    });
  });
}

/**
 * Renders an EJS layout from a given config object
 * @param  {Object} fileConfig A config object that includes a template, dest, and locals
 */
function render(fileConfig) {
  if (!validateFileConfig(fileConfig)) {
    return;
  }

  let templatePath = p.resolve(p.dirname(options.config), ensureExt(fileConfig.template, inputExt));

  fs.readFile(templatePath, 'utf8', (err, template) => {
    if (err) {
      return log.error(err);
    }

    handleOut(fileConfig, fixIncludePaths(template, fileConfig));
  });
}

function run() {
  config.files.forEach(render);
}

/**
 * Validates that a given config object for a file is valid
 * @param  {Object}  fileConfig A config object that includes a template, path, and locals
 * @return {Boolean}            Whether or not the config is valid
 */
function validateFileConfig(fileConfig) {
  const requiredParams = ['template'];

  let i = 0;
  let len = requiredParams.length;

  for (i; i < len; i++) {
    if (!fileConfig[requiredParams[i]]) {
      log.error(`"${requiredParams[i]}" must be present in order to create file. \n${JSON.stringify(fileConfig, null, 2)}`);
      return false;
    }
  }

  return true;
}
