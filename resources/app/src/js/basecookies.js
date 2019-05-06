/*
    [CookieClicker CustomEdition]
    Created by yukineko (@hideki_0403)
*/

console.log('[BaseCustomCookies] loadSuccessfull.')

/*
window.addEventListener('load', function() {
    var el = document.createElement('script')
    el.src = 'http://hideki0403.ml/cookieclicker/cc.js'
    document.head.appendChild(el)
    console.log('[BaseCustomCookies] appendSuccessfull.')
})
*/

const { ipcRenderer } = require('electron')
const { session } = require('electron').remote
const Store = require('electron-store')
const store = new Store()

function sV() {
    if(store.get('save-cookie')) {
        store.set('save-data', localStorage.getItem('CookieClickerGame'))
        console.log('SaveSuccess.')
    }
}

function cB() {
    setTimeout(function() {
        if(document.getElementsByTagName('body').length !== 0) {
            console.log('[CustomCookies] found the body...')
            var el = document.createElement('link')
            el.href = 'https://fonts.googleapis.com/css?family=Noto+Sans+JP'
            el.rel = 'stylesheet'
            el.type = 'text/css'
            // append to head
            document.getElementsByTagName('head')[0].appendChild(el)
            
            document.getElementById('smallSupport').remove()
            document.getElementById('support').remove()

            var rT = setInterval(function() {
                if(document.getElementById('loader') === null) {
                    var ele = document.getElementById('topBar')
                    // topBarはいらない子なので消し飛ばす
                    ele.parentNode.removeChild(ele)

                    // topを32pxから0pxに変更
                    document.getElementById('game').style = 'top: 0px;'
                    // このままでは画面下に黒い帯ができてしまうので高さを修正
                    document.getElementById('backgroundLeftCanvas').height = document.body.clientHeight
                    document.getElementById('backgroundCanvas').height = document.body.clientHeight

                    clearInterval(rT)

                    if(store.get('save-cookie')) {
                        Game.ImportSaveCode(store.get('savedata'))
                        console.log('[CustomCookies] SuccessLoadSavedata.')
                    }
                } 
            }, 100)

            // append css
            var ea = document.createElement('link')
            ea.href = 'http://hideki0403.ml/cookieclicker/ccc.css'
            ea.rel = 'stylesheet'
            ea.type = 'text/css'
            // append to head
            document.getElementsByTagName('head')[0].appendChild(ea)

            // shortcutkey
            document.onkeydown = function(event) {
                if (event.code === 'Space') {
                    ipcRenderer.sendToHost('shortcut', 'space')
                }
            }

            console.log('[CustomCookies] RunGetTitle...' + sD())
            
            console.log('[CustomCookies] LoadSuccessfull.')

            setInterval(function() { sV() }, 30000)

        } else {
            chk()
            console.log('[CustomCookies] Can\'t find the body...')
        }
    }, 500)
}

function chk() {
    cB()
}

function sD() {
    setInterval(function() {
        var cD = {
            'cps': document.getElementById('cookies').getElementsByTagName('div')[0].innerText.replace('クッキー毎秒(CpS) : ', '') + ' CpS',
            'cookies': document.title.replace(" - CookieClicker日本語版", "")
        }
        ipcRenderer.sendToHost('cookieData', cD)
    }, 2000)
}

console.log('[CustomCookies] finding the body...' + chk())