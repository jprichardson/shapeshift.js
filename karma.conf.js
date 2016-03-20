module.exports = function (config) {
  config.set({
    browserNoActivityTimeout: 15000,
    files: [
      'test/*.js'
    ],
    frameworks: ['browserify', 'detectBrowsers', 'tap'],
    plugins: [
      'karma-browserify',
      'karma-chrome-launcher',
      'karma-firefox-launcher',
      'karma-detect-browsers',
      'karma-tap'
    ],
    preprocessors: {
      'test/*.js': ['browserify']
    },
    singleRun: true,
    browserify: { debug: true },
    detectBrowsers: {
      enabled: true,
      usePhantomJS: false,
      postDetection: function (availableBrowser) {
        if (process.env.TRAVIS) {
          return ['Firefox']
        }

        var browsers = ['Chrome', 'Firefox']
        return browsers.filter(function (browser) {
          return availableBrowser.indexOf(browser) !== -1
        })
      }
    }
  })
}
