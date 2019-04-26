if(require('electron-squirrel-startup')) return

const electron = require('electron')
const os = require('os')
const platform = os.platform() + '_' + os.arch()
const app = electron.app
const version = app.getVersion()
const ipcMain = electron.ipcMain
const Menu = electron.Menu
const Tray = electron.Tray
const BrowserWindow = electron.BrowserWindow
const dialog = electron.dialog
const autoUpdater = electron.autoUpdater
const openAboutWindow = require('about-window').default
const windowStateKeeper = require('electron-window-state')

const updaterFeedURL = 'https://cookie-cicker-client.herokuapp.com/update/' + platform + '/' + version

function appUpdater(f) {

  autoUpdater.setFeedURL(updaterFeedURL)
  autoUpdater.on('error', err => console.log(err))
  autoUpdater.on('checking-for-update', () => console.log('checking-for-update'))
  autoUpdater.on('update-available', () => console.log('update-available'))
  autoUpdater.on('update-not-available', () => {
    if(f !== undefined) {
      dialog.showMessageBox({
        title: 'CookieClickerClient Updater',
        message: '現在のクライアントは最新版です'
      })
    } 
  })
  autoUpdater.on('update-downloaded', (event, releaseNotes, releaseName) => {
      let message = app.getName() + ' ' + releaseName
      if (releaseNotes) {
          const splitNotes = releaseNotes.split(/[^\r]\n/)
          message += '\n\nリリース内容:\n'
          splitNotes.forEach(notes => {
              message += notes + '\n\n'
          })
      }
      dialog.showMessageBox({
          type: 'question',
          buttons: ['再起動', 'あとで'],
          defaultId: 0,
          message: '新しいバージョンをダウンロードしました。再起動しますか？',
          detail: message
      }, response => {
          if (response === 0) {
              setTimeout(() => autoUpdater.quitAndInstall(), 1)
          }
      })
  })
  autoUpdater.checkForUpdates()

}

appUpdater()

function showErr(err) {
  dialog.showErrorBox('CookieClickerClient Error', err)
}

let mainWindow = null

app.on('window-all-closed', function() {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('ready', function() {
  const state = windowStateKeeper({
    defaultWidth: 1000,
    defaultHeight: 800
  })
  
  mainWindow = new BrowserWindow({x: state.x, y: state.y, width: state.width, height: state.height, icon: __dirname + '/src/icon.png'})
  mainWindow.setMenu(null)
  mainWindow.loadURL('file://' + __dirname + '/src/index.html')
  if(!app.isPackaged) {
    // if not packaged, open the devtools
    mainWindow.openDevTools()
  }

  var abouts = {
    icon_path: __dirname + '/src/icon.png',
    product_name: 'CookieClickerClient',
    description: 'クッキー職人用クライアント',
    copyright: 'Copyright (C) 2019 yukineko',
    use_version_info: true
  }

  const trayIcon = new Tray(__dirname + '/src/icon.png')
  var contextMenu = Menu.buildFromTemplate([
    { label: 'ウィンドウを表示', click: function() {mainWindow.show()} },
    { label: '更新があるか確認', click: function() {appUpdater('m')} },
    { label: 'このソフトについて', click: function() {openAboutWindow(abouts)}},
    { type: 'separator' },
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

  state.manage(mainWindow)

})