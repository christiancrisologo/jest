/**
 * Copyright (c) 2014, Facebook, Inc. All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @flow
 */

'use strict';

const wrap = require('jest-util').wrap;

const usage = 'Usage: $0 [--config=<pathToConfigFile>] [TestPathRegExp]';

const options = {
  cache: {
    default: true,
    description: wrap(
      'Whether to use the preprocessor cache. Disable the cache using ' +
      '--no-cache.',
    ),
    type: 'boolean',
  },
  config: {
    alias: 'c',
    description: wrap('The path to a Jest config file.'),
    type: 'string',
  },
  debug: {
    description: wrap(
      'Print debugging info about your jest config.',
    ),
    type: 'boolean',
  },
  version: {
    alias: 'v',
    description: wrap('Print the version and exit'),
    type: 'boolean',
  },
  watchman: {
    default: true,
    description: wrap(
      'Whether to use watchman for file crawling. Disable using ' +
      '--no-watchman.',
    ),
    type: 'boolean',
  },
};

module.exports = {
  options,
  usage,
};
