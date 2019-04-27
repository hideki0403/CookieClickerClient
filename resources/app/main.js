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
const session = electron.session
const openAboutWindow = require('about-window').default
const windowStateKeeper = require('electron-window-state')
const Store = require('electron-store')
const config = new Store()
const AutoLaunch = require('auto-launch')
const autolauncher = new AutoLaunch({name: 'CookieClickerClient'})

const updaterFeedURL = 'http://cookie-clicker-client.herokuapp.com/update/' + platform + '/' + version

function appUpdater(f) {

  autoUpdater.setFeedURL(updaterFeedURL)
  autoUpdater.on('error', err => console.log(err))
  autoUpdater.on('checking-for-update', () => console.log('checking-for-update'))
  autoUpdater.on('update-available', () => {
    if(f !== undefined) {
      dialog.showMessageBox({
        title: 'CookieClickerClient Updater',
        message: '更新が見つかりました。ダウンロードを開始します。'
      })
    } 
  })

  autoUpdater.on('update-not-available', () => {
    if(f !== undefined) {
      dialog.showMessageBox({
        title: 'CookieClickerClient Updater',
        message: '現在のクライアントは最新版です'
      })
    } 
  })

  autoUpdater.on('update-downloaded', (event, releaseNotes, releaseName) => {
      let message = '[CookieClickerClient v' + releaseName + ']'
      if (releaseNotes) {
          const splitNotes = releaseNotes.split(/[^\r]\n/)
          message += '\n\nリリース内容:\n'
          splitNotes.forEach(notes => {
              message += notes + '\n\n'
          })
      }
      dialog.showMessageBox({
        title: 'CookieClickerClient Updater',
        message: '新しいバージョンをダウンロードしました。\n更新データは次回起動時に適応されます。',
        detail: message
      })
  })
  autoUpdater.checkForUpdates()

}

appUpdater()

function showErr(err) {
  dialog.showErrorBox('CookieClickerClient Error', err)
}

function store(item) {
  if(config.get(item) === undefined) {
    config.set(item, false)
  }
  return config.get(item)
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
  
  mainWindow = new BrowserWindow({show: false, x: state.x, y: state.y, width: state.width, height: state.height, icon: __dirname + '/src/icon.png'})

  mainWindow.webContents.on('did-finish-load', () => {
    if(!store('visible')) {
      mainWindow.show()
    }
  })

  const menu = Menu.buildFromTemplate([
    {
      label: 'メニュー',
      submenu: [
        { label: '再起動', click: function() {app.relaunch(); app.exit()} },
        { label: '終了', click: function() {app.exit()} }
      ]
    }, {
      label: '設定',
      submenu: [
        {
          label: 'スタートアップに登録する',
          type: 'checkbox',
          checked: store('startup'),
          click: function() {
            if(store('startup')) {
              autolauncher.disable()
              config.set('startup', false)
            } else {
              autolauncher.enable()
              config.set('startup', true)
            }
          }
        }, {
          label: '起動時にウィンドウを表示しない',
          type: 'checkbox',
          checked: store('visible'),
          click: function() {
            if(store('visible')) {
              config.set('visible', false)
            } else {
              config.set('visible', true)
            }
          }
        },{
          type: 'separator'
        }, {
          label: '詳細設定',
          submenu: [
            {
              label: 'データを外部保存する',
              type: 'checkbox',
              checked: store('save-cookie'),
              click: function() {
                if(store('save-cookie')) {
                  config.set('save-cookie', false)
                } else {
                  config.set('save-cookie', true)
                }
              }
            }
          ]
        }
      ]
    }, {
      label: 'ヘルプ',
      submenu: [
        { label: '更新があるか確認', click: function() {appUpdater('m')} },
        { type: 'separator' },
        { label: 'バージョン情報', click: function() {openAboutWindow(abouts)}}
      ]
    }
  ])

  mainWindow.setMenu(menu)
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