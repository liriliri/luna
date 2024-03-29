var BrowserFS = BrowserFS
var afs
var initializationCount = 0
var console = parent.console

function idbfsInit() {
  var imfs = new BrowserFS.FileSystem.InMemory()
  if (BrowserFS.FileSystem.IndexedDB.isAvailable()) {
    afs = new BrowserFS.FileSystem.AsyncMirror(
      imfs,
      new BrowserFS.FileSystem.IndexedDB(function (e, fs) {
        if (e) {
          afs = new BrowserFS.FileSystem.InMemory()
          console.log(
            'WEBPLAYER: error: ' + e + ' falling back to in-memory filesystem'
          )
          setupFileSystem('browser')
          appInitialized()
        } else {
          afs.initialize(function (e) {
            if (e) {
              afs = new BrowserFS.FileSystem.InMemory()
              console.log(
                'WEBPLAYER: error: ' +
                  e +
                  ' falling back to in-memory filesystem'
              )
              setupFileSystem('browser')
              appInitialized()
            } else {
              idbfsSyncComplete()
            }
          })
        }
      }, 'RetroArch')
    )
  }
}

function idbfsSyncComplete() {
  console.log('WEBPLAYER: idbfs setup successful')

  setupFileSystem('browser')
  appInitialized()
}

function appInitialized() {
  initializationCount++
  if (initializationCount == 2) {
    preLoadingComplete()
  }
}

function preLoadingComplete() {
  initCfg()
  downloadGame().then(startRetroArch)
}

function hideLoading() {
  document.getElementById('loading').style.display = 'none'
}

function downloadGame() {
  return fetch(gameUrl)
    .then((response) => response.arrayBuffer())
    .then((buffer) => {
      var name = getFileName(gameUrl)
      var dataView = new Uint8Array(buffer)
      FS.createDataFile('/', name, dataView, true, false)
      var data = FS.readFile(name, { encoding: 'binary' })
      var path = '/home/web_user/retroarch/userdata/' + name
      FS.writeFile(path, data, { encoding: 'binary' })
      FS.unlink(name)

      return path
    })
}

function getFileName(url) {
  let ret = url.split('/')
  ret = ret[ret.length - 1]

  if (ret.indexOf('?') > -1) ret = ret.split('?')[0].trim()

  if (ret === '') {
    ret = 'game'
  }

  return ret
}

function setupFileSystem(backend) {
  var mfs = new BrowserFS.FileSystem.MountableFileSystem()

  console.log('WEBPLAYER: initializing filesystem: ' + backend)
  mfs.mount('/home/web_user/retroarch/userdata', afs)

  BrowserFS.initialize(mfs)
  var BFS = new BrowserFS.EmscriptenFS()
  FS.mount(BFS, { root: '/home' }, '/home')
  console.log('WEBPLAYER: ' + backend + ' filesystem initialization successful')
}

function initCfg() {
  var path = '/home/web_user/retroarch/userdata/retroarch.cfg'
  var cfg = ['menu_driver = "rgui"'].join('\n')
  cfg += '\n' + retroarchCfg

  FS.writeFile(path, cfg)

  path = '/home/web_user/retroarch/userdata/retroarch-core-options.cfg'
  cfg = retroarchCoreOptionsCfg
  FS.writeFile(path, cfg)
}

function startRetroArch(path) {
  hideLoading()
  Module['callMain'](['-v', path])
  Module['resumeMainLoop']()
  document.getElementById('canvas').focus()
}

var Module = {
  noInitialRun: true,
  arguments: ['-v', '--menu'],
  preRun: [],
  postRun: [],
  onRuntimeInitialized: function () {
    appInitialized()
  },
  print: function (text) {
    console.log(text)
  },
  printErr: function (text) {
    console.log(text)
  },
  canvas: document.getElementById('canvas'),
  totalDependencies: 0,
  monitorRunDependencies: function (left) {
    this.totalDependencies = Math.max(this.totalDependencies, left)
  },
}

window.addEventListener('load', function () {
  window.focus()
  document.body.addEventListener(
    'click',
    function (e) {
      window.focus()
    },
    false
  )
  idbfsInit()
})
