/**
 * Copyright (c) 2014-present, Facebook, Inc. All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @emails oncall+jsinfra
 */
'use strict';

let createRuntime;

const moduleNameMapper = {
  '^image![a-zA-Z0-9$_-]+$': 'GlobalImageStub',
  '^[./a-zA-Z0-9$_-]+\.png$': 'RelativeImageStub',
  'mappedToPath': '<rootDir>/GlobalImageStub.js',
  'mappedToDirectory': '<rootDir>/MyDirectoryModule',
  'module/name/(.*)': '<rootDir>/mapped_module_$1.js',
};

beforeEach(() => {
  createRuntime = require('createRuntime');
});

describe('transitive dependencies', () => {
  const expectUnmocked = nodeModule => {
    const moduleData = nodeModule();
    expect(moduleData.isUnmocked()).toBe(true);
    expect(moduleData.transitiveNPM3Dep).toEqual('npm3-transitive-dep');
    expect(moduleData.internalImplementation())
      .toEqual('internal-module-code');
  };

  it('unmocks transitive dependencies in node_modules by default', () =>
    createRuntime(__filename, {
      moduleNameMapper,
      unmockedModulePathPatterns: ['npm3-main-dep'],
    }).then(runtime => {
      const root = runtime.requireModule(
        runtime.__mockRootPath,
        './root.js',
      );
      expectUnmocked(runtime.requireModuleOrMock(
        runtime.__mockRootPath,
        'npm3-main-dep',
      ));

      // Test twice to make sure Runtime caching works properly
      root.jest.resetModuleRegistry();
      expectUnmocked(runtime.requireModuleOrMock(
        runtime.__mockRootPath,
        'npm3-main-dep',
      ));

      // Directly requiring the transitive dependency will mock it
      const transitiveDep = runtime.requireModuleOrMock(
        runtime.__mockRootPath,
        'npm3-transitive-dep',
      );
      expect(transitiveDep()).toEqual(undefined);
    }),
  );

  it('unmocks transitive dependencies in node_modules when using unmock', () =>
    createRuntime(__filename, {moduleNameMapper}).then(runtime => {
      const root = runtime.requireModule(runtime.__mockRootPath);
      root.jest.unmock('npm3-main-dep');
      expectUnmocked(runtime.requireModuleOrMock(
        runtime.__mockRootPath,
        'npm3-main-dep',
      ));

      // Test twice to make sure Runtime caching works properly
      root.jest.resetModuleRegistry();
      expectUnmocked(runtime.requireModuleOrMock(
        runtime.__mockRootPath,
        'npm3-main-dep',
      ));

      // Directly requiring the transitive dependency will mock it
      const transitiveDep = runtime.requireModuleOrMock(
        runtime.__mockRootPath,
        'npm3-transitive-dep',
      );
      expect(transitiveDep()).toEqual(undefined);
    }),
  );

  it('unmocks transitive dependencies in node_modules by default when using both patterns and unmock', () =>
    createRuntime(__filename, {
      moduleNameMapper,
      unmockedModulePathPatterns: ['banana-module'],
    }).then(runtime => {
      const root = runtime.requireModule(runtime.__mockRootPath);
      root.jest.unmock('npm3-main-dep');
      expectUnmocked(runtime.requireModuleOrMock(
        runtime.__mockRootPath,
        'npm3-main-dep',
      ));

      // Test twice to make sure Runtime caching works properly
      root.jest.resetModuleRegistry();
      expectUnmocked(runtime.requireModuleOrMock(
        runtime.__mockRootPath,
        'npm3-main-dep',
      ));

      // Directly requiring the transitive dependency will mock it
      const transitiveDep = runtime.requireModuleOrMock(
        runtime.__mockRootPath,
        'npm3-transitive-dep',
      );
      expect(transitiveDep()).toEqual(undefined);
    }),
  );

  it('mocks deep dependencies when using unmock', () =>
    createRuntime(__filename, {moduleNameMapper}).then(runtime => {
      const root = runtime.requireModule(
        runtime.__mockRootPath,
        './root.js',
      );
      root.jest.unmock('FooContainer.react');

      const FooContainer = runtime.requireModuleOrMock(
        runtime.__mockRootPath,
        'FooContainer.react',
      );

      expect(new FooContainer().render().indexOf('5')).toBe(-1);
    }),
  );

  it('does not mock deep dependencies when using deepUnmock', () =>
    createRuntime(__filename, {moduleNameMapper}).then(runtime => {
      const root = runtime.requireModule(
        runtime.__mockRootPath,
        './root.js',
      );
      root.jest.deepUnmock('FooContainer.react');

      const FooContainer = runtime.requireModuleOrMock(
        runtime.__mockRootPath,
        'FooContainer.react',
      );

      expect(new FooContainer().render().indexOf('5')).not.toBe(-1);
    }),
  );
});
