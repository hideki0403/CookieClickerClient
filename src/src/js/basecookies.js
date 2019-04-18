/*
    [CookieClicker CustomEdition]
    Created by yukineko (@hideki_0403)

    can use jquery.
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

const {ipcRenderer} = require('electron')

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

            setTimeout(function() {
                var ele = document.getElementById('topBar')
                while( ele.firstChild ){
                    ele.removeChild( ele.firstChild )
                }
                // append to topBar
                document.getElementById('topBar').innerHTML = '<marquee id="marquee" style="font-size: 20px;">[CustomCookieClicker] NowLoading...</marquee>'
            }, 1500)

            // append css
            var ea = document.createElement('link')
            ea.href = 'http://hideki0403.ml/cookieclicker/ccc.css'
            ea.rel = 'stylesheet'
            ea.type = 'text/css'
            // append to head
            document.getElementsByTagName('head')[0].appendChild(ea)

            console.log('[CustomCookies] RunGetTitle...' + sD())
            console.log('[CustomCookies] RunCustomHeader...' + uT())
            
            console.log('[CustomCookies] LoadSuccessfull.')

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
        ipcRenderer.sendToHost('cookieData', document.title.replace(" - CookieClicker日本語版", ""))
    }, 2000)
}

function uT() {
    setInterval(function() {
        var li = document.getElementsByClassName('listing')
        var hd = new Array()
        for(var i=0; li.length > i; i++) {
            if(!li[i].innerText.match(/フレーバークッキー|ミルクはそれぞれの実績|隠し実績|解除済みのミルク/ || li[i].innerText === '')) {
                hd.push(li[i].innerText)
            }
        }
        document.getElementById('marquee').innerHTML = hd.join('&emsp;')
    }, 1000)
}

console.log('[CustomCookies] finding the body...' + chk())