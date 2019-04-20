const electron = require('electron')
const download = require('download')
const https = require('https')
const fs = require('fs')
const app = electron.app
const ipcMain = electron.ipcMain
const Menu = electron.Menu
const Tray = electron.Tray
const BrowserWindow = electron.BrowserWindow
const dialog = electron.dialog
const _dir = app.getAppPath() + '/'

let mainWindow = null

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
          if(app.getVersion() !== res.version || f === 'debug') {
            var options = {
              title: 'CookieClickerClient Updater',
              type: 'info',
              message: 'バージョン' + res.version + 'がリリースされました',
              detail: '更新内容: ' + res.updatelog + '\n\n更新しますか？',
              buttons: ['Yes', 'No']
            }

            dialog.showMessageBox(mainWindow, options, function(response) {
              if(response === 0) {
                var fileStr = fs.createWriteStream(_dir + 'resources/app')
                download('https://github.com/hideki0403/CookieClickerClient/raw/master/packaged/' + res.version + '/app.asar').pipe(fileStr)

                fileStr.on('close', function() {
                  fs.rename(_dir + 'resources/app', _dir + 'resources/app.asar', function(err) {
                    if(err) {
                      console.log(err)
                    } else {
                      dialog.showMessageBox(mainWindow, {title: 'CookieClickerClient Updater --> v.' + res.version, message: 'アップデートに成功しました。\nアップデートを反映させるため再起動します。'})
                      app.relaunch()
                      app.exit()
                    }
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

app.on('window-all-closed', function() {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('ready', function() {
  mainWindow = new BrowserWindow({width: 800, height: 600, icon: __dirname + '/src/icon.png'})
  mainWindow.setMenu(null)
  mainWindow.loadURL('file://' + __dirname + '/src/index.html')
  if(!app.isPackaged) {
    // if not packaged, open the devtools
    mainWindow.openDevTools()
  }

  checkUpdate('auto')


  const trayIcon = new Tray(__dirname + '/src/icon.png')
  var contextMenu = Menu.buildFromTemplate([
    { label: 'ウィンドウを表示', click: function() {mainWindow.show()} },
    { label: '更新があるか確認', click: function() {checkUpdate('manual')} },
    { label: '再起動', click: function() {app.relaunch(); app.exit()} },
    { label: '終了', click: function() {app.exit()} }
  ])
  trayIcon.setContextMenu(contextMenu)
  trayIcon.setToolTip('Loading - CCC v' + app.getVersion())

  trayIcon.on('click', function () {
    if(mainWindow.isVisible()) {
      mainWindow.close()
    } else {
      mainWindow.show()
    }
  })

  mainWindow.on('close', (event) => {
    event.preventDefault()
    mainWindow.hide()
  })

  mainWindow.webContents.on('new-window', (ev,url)=> {
    shell.openExternal(url)
  })

  // update the tray tip
  ipcMain.on('cookieData', (event, arg) => {
    trayIcon.setToolTip(arg + ' - CCC v' + app.getVersion())
  })

  // shortcut key
  ipcMain.on('shortcut', (event, arg) => {
    switch(arg) {
      case 'space':
        mainWindow.hide()
    }
  })
})