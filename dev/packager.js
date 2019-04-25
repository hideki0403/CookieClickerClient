var packager = require('electron-packager')
var src = '../resources/app'
var config = require(src + '/package.json')
var electronInstaller = require('electron-winstaller')

var version = config.version

console.log('[Packager] CreatePackage')
packager({  
  dir: src,
  out: '../packaged/' + version,
  name: 'CookieClickerClient',
  platform: 'win32',
  arch: 'x64',
  icon: './icon.ico',

  'app-bundle-id': 'ml.hideki0403',
  'app-version': version,

  overwrite: true,
  asar: true,
  prune: true,
  ignore: "node_modules/(electron-packager|electron-prebuilt|\.bin)|release\.js",
}).then(() => {
  console.log('[Packager] done.')

  electronInstaller.createWindowsInstaller({
    appDirectory: '../packaged/' + version + '/CookieClickerClient-win32-x64',
    outputDirectory: '../packaged/installers/' + version,
    authors: 'yukineko',
    exe: 'CookieClickerClient.exe',
    setupIcon: './icon.ico',
    description: 'クッキー職人用クライアント'
  });

  /*
  zipdir('../packaged/' + version + '/cookie-clicker-client-win32-ia32', { saveTo: '../packaged/' + version + '/cookie-clicker-client-win32-ia32.zip' }, function (err, buffer) {
    if(err) {
      console.log(err)
    } else {
      console.log('[Packager] ia32 zipped.')
      zipdir('../packaged/' + version + '/cookie-clicker-client-win32-x64', { saveTo: '../packaged/' + version + '/cookie-clicker-client-win32-x64.zip' }, function (err, buffer) {
        if(err) {
          console.log(err)
        } else {
          console.log('[Packager] x64 zipped.')
          fs.copyFile('../packaged/' + version + '/cookie-clicker-client-win32-x64/resources/app.asar', '../packaged/' + version + '/app.asar', function(err) {
            if(err) {
              console.log(err)
            } else {
              console.log('[Packager] Copy app.asar')
              function createMd5() {
                const target = fs.readFileSync('../packaged/' + version + '/app.asar')
                const md5hash = crypto.createHash('md5')
                md5hash.update(target)
                return md5hash.digest('hex')
              }
              
              var md5 = createMd5()
              fs.writeFile('../packaged/' + version + '/md5', md5, function(err){
                if(err) {
                  console.log(err)
                } else {
                  console.log('[Packager] MD5:' + md5)
                  console.log('[Packager] All done!')
                }
              })
            }
          })
        }
      })
    }
  })
  */
})