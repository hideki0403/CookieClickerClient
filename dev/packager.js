var packager = require('electron-packager')
var config = require('../src/package.json')

var version = "2.0.1"

packager({  
  dir: '../src',
  out: '../packaged/' + version,
  name: config.name,
  platform: 'win32',
  arch: 'all',
  icon: './icon.ico',

  'app-bundle-id': 'ml.hideki0403',
  'app-version': version,

  overwrite: false,
  asar: true,
  prune: true,
  ignore: "node_modules/(electron-packager|electron-prebuilt|\.bin)|release\.js",
}, function done (err, appPath) {
  if(err) {
    throw new Error(err)
  }
  console.log('Done!!')
})