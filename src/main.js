const electron = require('electron')
const download = require('download')
const https = require('https')
const app = electron.app
const ipcMain = electron.ipcMain
const Menu = electron.Menu
const Tray = electron.Tray
const BrowserWindow = electron.BrowserWindow

let mainWindow = null

function checkUpdate() {
  https.get('https://raw.githubusercontent.com/hideki0403/CookieClickerClient/master/src/package.json', function(res) {
    var body = ''
    res.setEncoding('utf8')
    res.on('data', function (chunk) {
        body += chunk
    })
    res.on('data', function (chunk) {
        res = JSON.parse(body)
        
    })
  }).on('error', function (error) {
    console.log(error.message)
  })
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

  const trayIcon = new Tray(__dirname + '/src/icon.png')
  var contextMenu = Menu.buildFromTemplate([
    { label: 'ウィンドウを表示', click: function() {mainWindow.show()} },
    { label: '再起動', click: function() {app.relaunch(); app.exit()} },
    { label: '終了', click: function() {app.exit()} }
  ])
  trayIcon.setContextMenu(contextMenu)
  trayIcon.setToolTip('Loading - CCC v2')

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

  // update the tray tip
  ipcMain.on('cookieData', (event, arg) => {
    trayIcon.setToolTip(arg + ' - CCC v2')
  })

  // shortcut key
  ipcMain.on('shortcut', (event, arg) => {
    switch(arg) {
      case 'space':
        mainWindow.hide()
    }
  })
})