'use strict';

const push = require('./push');
const merge = require('./merge');

module.exports = {
  ...push,
  ...merge,
};
