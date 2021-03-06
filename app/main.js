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
const powerSaveBlocker = electron.powerSaveBlocker
const shell = electron.shell
const Notification = electron.Notification
const openAboutWindow = require('about-window').default
const windowStateKeeper = require('electron-window-state')
const Store = require('electron-store')
const config = new Store()
const AutoLaunch = require('auto-launch')
const autolauncher = new AutoLaunch({name: 'CookieClickerClient'})
const client = require('discord-rich-presence')('571916334791917576')
const timestamp = Date.now()
const ProgressBar = require('electron-progressbar')

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

      progressBar = new ProgressBar({
        text: 'ダウンロードしています...',
        detail: 'checking...',
        style: {
          bar: {
            'background': 'white'
          },
          value: {
            'background': '#06b025'
          }
        }
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
      let message = 'CookieClickerClient v' + releaseName + ''
      if (releaseNotes) {
          const splitNotes = releaseNotes.split(/[^\r]\n/)
          message += '\n\nリリース内容:\n'
          splitNotes.forEach(notes => {
              message += notes + '\n\n'
          })
      }
      progressBar.setCompleted()
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

function showDialog(msg) {
  dialog.showMessageBox({
    title: 'CookieClickerClient',
    detail: msg
  })
}

function store(item) {
  if(config.get(item) === undefined) {
    config.set(item, false)
  }
  return config.get(item)
}

count = 0

function updateRPC(cookies) {
  if(!store('disableRPC')) {
    if(count++ % 20 === 0) {
      client.updatePresence({
        details: cookies.cookies,
        state: cookies.cps,
        startTimestamp: timestamp,
        largeImageKey: 'icon',
        largeImageText: 'Clicking on a cookie',
        smallImageKey: 'sub',
        smallImageText: 'CookieClickerClient v' + version,
        instance: true,
      })
    }
  }
}

let mainWindow = null

app.on('window-all-closed', function() {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

if(store('rendererblocker')) {
  app.commandLine.appendSwitch('disable-renderer-backgrounding')
}

if(store('powersaveblocker')) {
  powerSaveBlocker.start('prevent-app-suspension')
}

if (!app.requestSingleInstanceLock()) {
  app.exit()
} else {
  app.on('second-instance', (e, c, w) => {
    mainWindow.show()
  })

  app.on('ready', function() {

    const state = windowStateKeeper({
      defaultWidth: 1000,
      defaultHeight: 800
    })
    
    mainWindow = new BrowserWindow({show: false, x: state.x, y: state.y, width: state.width, height: state.height, icon: __dirname + '/src/icon.png', webPreferences: {nodeIntegration: true, webviewTag: true}})
  
    mainWindow.webContents.on('did-finish-load', () => {
      if(!store('visible')) {
        mainWindow.show()
      }
    })
  
    updateRPC('')
  
    const menu = Menu.buildFromTemplate([
      {
        label: 'メニュー',
        submenu: [
          { label: 'ページ再読み込み', click: function(e, f) {f.reload()} },
          { type: 'separator'},
          { 
            label: 'ツール',
            submenu: [
              {
                label: '連打ツール',
                type: 'checkbox',
                checked: store('renda'),
                click: function() {
                  if(store('renda')) {
                    config.set('renda', false)
                  } else {
                    dialog.showMessageBox({
                      title: '警告!!!',
                      detail: '連打ツールを使用するにあたって、以下の注意を必ずお読みください。\n\n・ゲームバランスが崩壊する可能性があります。\n・CPU使用率が上がります\n・このツールの連打力は1000クリック/秒です。理論値です。\n・音とエフェクトが物凄くうるさいので「数字表示」をOFFに、音量を0%にすることを推奨します。\n・適度に使いましょう。乱用は厳禁です。\n\n以上に同意できた場合のみ使用してください。\nこれは再起動後に有効になります。'
                    })
                    config.set('renda', true)
                  }
                }
              }
            ]
          },
          { type: 'separator'},
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
          }, {
            label: 'DiscordRPCを無効化する',
            type: 'checkbox',
            checked: store('disableRPC'),
            click: function() {
              if(store('disableRPC')) {
                config.set('disableRPC', false)
              } else {
                config.set('disableRPC', true)
              }
            }
          }, {
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
              }, {
                label: '描画優先度を下げない',
                type: 'checkbox',
                checked: store('rendererblocker'),
                click: function() {
                  showDialog('変更を適応するためには再起動をしてください')
                  if(store('rendererblocker')) {
                    config.set('rendererblocker', false)
                  } else {
                    config.set('rendererblocker', true)
                  }
                }
              }, {
                label: '動作優先度を下げない',
                type: 'checkbox',
                checked: store('powersaveblocker'),
                click: function() {
                  showDialog('変更を適応するためには再起動をしてください')
                  if(store('powersaveblocker')) {
                    config.set('powersaveblocker', false)
                  } else {
                    config.set('powersaveblocker', true)
                  }
                }
              }, {
                type: 'separator'
              }, {
                label: 'デバッグ',
                submenu: [
                  {
                    label: '開発者ツール (Renderer)',
                    click: function() {
                      mainWindow.openDevTools()
                    }
                  }, {
                    label: '開発者ツール (WebView)',
                    click: function() {
                      mainWindow.webContents.send('openDevTools')
                    }
                  }
                ]
              }
  
            ]
          }
        ]
      }, {
        label: 'ヘルプ',
        submenu: [
          { label: 'ヘルプを開く', click: function() {shell.openExternal('https://github.com/hideki0403/CookieClickerClient/wiki/help')}},
          { label: '更新があるか確認', click: function() {appUpdater('m')} },
          { type: 'separator' },
          { label: 'バージョン情報', click: function() {openAboutWindow(abouts)}}
        ]
      }
    ])
  
    Menu.setApplicationMenu(menu)

    mainWindow.loadURL('file://' + __dirname + '/src/index.html')
    if(!app.isPackaged) {
      // if not packaged, open the devtools
      mainWindow.openDevTools()
    }
  
    var abouts = {
      icon_path: __dirname + '/src/icon.png',
      product_name: 'CookieClickerClient',
      description: 'クッキー職人用クライアント',
      copyright: 'Copyright (C) 2019-2020 yukineko',
      use_version_info: true
    }
  
    const trayIcon = new Tray(__dirname + '/src/icon.png')
    var contextMenu = Menu.buildFromTemplate([
      { label: 'ウィンドウを表示', click: function() {mainWindow.show()} },
      { type: 'separator' },
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
      /*
      if(!store('notification')) {
        console.log('enable')
        var n = new Notification({
          title: 'CookieClickerClient',
          body: 'CookieClickerClientは通知バーに格納されました。\nアイコンをクリックすることでウィンドウを再表示できます。\nこのメッセージは次回以降表示されません。'
        })

        n.show()
      }
      */
    })
  
    mainWindow.webContents.on('new-window', (ev,url)=> {
      shell.openExternal(url)
    })
  
    // update the tray tip
    ipcMain.on('cookieData', (event, arg) => {
      trayIcon.setToolTip(arg.cookies + '\nCCC v' + app.getVersion())
      updateRPC(arg)
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
  
}