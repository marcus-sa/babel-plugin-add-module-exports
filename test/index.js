import assert from 'assert'
import { testPlugin, equal } from './helpers'
import testCases from './spec'

describe('babel-plugin-add-module-exports', () => {
  it('should not export default to `module.exports` by default.', () =>
    testPlugin(testCases[0].code, {
      presets: ['es2015']
    }, (module) => {
      assert(module !== 'default-entry')
      assert(module.default === 'default-entry')
    }))

  it('plugin should export to module.exports(#31)', () => {
    const plugin = require('../src')
    assert(typeof plugin === 'function')
  })

  it('should handle duplicated plugin references (#1)', () =>
    testPlugin(testCases[0].code, {
      presets: ['es2015'],
      plugins: [
        './src/index.js',
        './src/index.js',
        './src/index.js'
      ]
    }, (module) => {
      assert(module === 'default-entry')

      // @see https://github.com/59naga/babel-plugin-add-module-exports/issues/12#issuecomment-157023722
      assert(module.default === undefined)
    }))

  it('should export with `babel-plugin-rewire` (#19)', () =>
      testPlugin("export default { stuff: 'things' }", {
        presets: ['react', 'es2015'],
        plugins: [
          './src/index.js',
          'rewire'
        ]
      }, (module) => {
        assert(module.stuff === 'things')
      }))

  testCases.forEach((testCase) =>
    it(`should ${testCase.name}`, () =>
      testPlugin(testCase.code, {
        presets: ['es2015'],
        plugins: [
          'transform-export-extensions', // use export-from syntax
          './src/index.js'
        ]
      }, (module) => {
        // assert module root (module.exports) object
        equal(module, testCase.expected.module)

        // assert each common entry is exported without error
        Object.keys(testCase.expected.exports).forEach((key) =>
          equal(module[key], testCase.expected.exports[key]))
      })))
})
