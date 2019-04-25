// 惜しくも不要になったソースコードたち

// 自作アップデーター
function checkUpdate(f) {
    if(app.isPackaged || f === 'debug') {
      https.get('https://raw.githubusercontent.com/hideki0403/CookieClickerClient/master/src/package.json', function(res) {
        var body = ''
        res.setEncoding('utf8')
        res.on('data', function (chunk) {
            body += chunk
        })
        res.on('data', function (chunk) {
            res = JSON.parse(body)
  
            var newVersion = res.version
  
            fs.copyFile(__dirname + '/updater.js', _dir)
  
            if(app.getVersion() !== newVersion || f === 'debug') {
              var options = {
                title: 'CookieClickerClient Updater',
                type: 'info',
                message: 'バージョン' + newVersion + 'がリリースされました',
                detail: '更新内容: ' + res.updatelog + '\n\n更新しますか？',
                buttons: ['Yes', 'No']
              }
  
              dialog.showMessageBox(mainWindow, options, function(response) {
                if(response === 0) {
                  download('https://github.com/hideki0403/CookieClickerClient/raw/master/packaged/' + newVersion + '/app.asar', _dir + 'resources', {filename: 'app.update'}).then(() => {
  
                    fs.readFile(_dir + 'resources/app.update', function(err, buf) {
                      md5c = md5(buf)
  
                      request('https://raw.githubusercontent.com/hideki0403/CookieClickerClient/master/packaged/' + newVersion + '/md5', function (err, res, data) {
  
                        if(md5c === data) {
                          // if success
                          exec()
                          dialog.showMessageBox(mainWindow, {title: 'CookieClickerClient Updater --> v.' + newVersion, message: 'アップデートに成功しました。\nアップデートを反映させるため再起動します。\n\nMD5: ' + md5c})
                          app.relaunch()
                          app.exit()
  
                        } else {
                          // if error
                          dialog.showErrorBox('CookieClickerClient Updater', 'アップデートに失敗しました。\n\nMD5:' + md5c)
                        }
                      
                      
                      })
                    })
                      
                  })
                }
              })
  
            } else {
              if(f === 'manual') {
                dialog.showMessageBox(mainWindow, {title: 'CookieClickerClient Updater', message: 'CookieClickerClientは最新版(v' + app.getVersion() + ')です'})
              }
            }
        })
      }).on('error', function (error) {
        console.log(error.message)
      })
    }
  }