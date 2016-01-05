'use strict';

const p = require('path');
const chalk = require('chalk');
const constants = require('./constants.js');

let colors = {
  main:     chalk.cyan.bold,
  status:   chalk.cyan,
  error:    chalk.red,
  warning:  chalk.yellow,
  success:  chalk.green
};

exports.error = (msg, stack) => {
  if (!(msg instanceof Error)) {
    if (!!stack) {
      msg = new Error(`${msg}\n`).stack;
    } else {
      msg = new Error(msg);
    }
  } else if (!!stack) {
    msg = msg.stack;
  }

  write(msg, 'error');
};

exports.start = () => {
  write('Running...', 'status');
};

exports.done = () => {
  write('Done.', 'status');
};

exports.success = (msg) => {
  write(msg, 'success');
};

exports.warning = (msg) => {
  write(msg, 'warning');
};

exports.newLine = (msg, type) => {
  let offset = task.length + 3;
  let i = 0;

  for (i; i < offset; i++) {
    msg = ` ${msg}`;
  }

  write(msg, null, type);
};

exports.write = write;


function prefix(msg, type) {
  type = type ? type : 'main';

  return `[${colors[type](msg)}]`;
}

function write(msg, type) {
  if (typeof msg === 'object' && !(msg instanceof Error)) {
    msg = JSON.stringify(msg, null, 2);
  }

  msg = type ? colors[type](msg) : msg;

  process.stdout.write(`${prefix(constants.APP_NAME)} ${msg}\n`);
}