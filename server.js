#!/usr/bin/env node 
require('./helper')
let fs = require('fs')
let wrap = require('co-express')
let path = require('path')

let trycatch = require('trycatch')
let express = require('express')
let morgan = require('morgan')
let nodeify = require('bluebird-nodeify')
let mime = require('mime-types')
let rimraf = require('rimraf')
let mkdirp = require('mkdirp')
let argv = require('yargs').argv

const NODE_ENV = process.env.NODE_ENV || 'development'
const PORT = process.env.PORT || 8000
const ROOT_DIR = path.resolve(argv.dir || process.cwd())


function* main() {
    console.log('Starting server...')

    // Your implementation here
    let app = express()
    
    if (NODE_ENV === 'development'){
      app.use(morgan('dev'))
    }

    app.use((req, res, next) => {
      trycatch(next, e => {
            console.log(e.stack)
            res.writeHead(500)
            res.end(e.stack)
      })
    })

    app.listen(PORT, ()=>console.log(`LISTENING @ http://127.0.0.1:${PORT}`))

    app.get('*',wrap(setFileMeta), wrap(sendHeaders), read)

    app.head('*',wrap(setFileMeta), wrap(sendHeaders), (req, res) => res.end())
    
    app.delete('*', wrap(setFileMeta), wrap(del))
    app.put('*', wrap(setFileMeta), setDirDetails, wrap(put))
    app.post('*', wrap(setFileMeta), setDirDetails, wrap(post))
}

function* put(req, res, next){
    if (req.stat) return res.send(405, 'File exists')
    yield mkdirp.promise(req.dirPath)
 
    if (!req.isDir) req.pipe(fs.createWriteStream(req.filePath))
    res.end()
}
function* post(req, res, next){
    if (!req.stat) return res.send(405, 'File does not exist')
    if (req.isDir) return res.send(405, 'Path is a directory')
    yield fs.promise.truncate(req.filePath, 0)

    req.pipe(fs.createWriteStream(req.filePath))
    res.end()
}
function* del(req, res, next){
  if (!req.stat) return res.send(400, 'Invalid Path')
  if (req.stat.isDirectory()){
    yield rimraf.promise(req.filePath)
  }
  else{
    yield fs.promise.unlink(req.filePath)
  }
  res.end()
}

function read(req, res, next){
  if (res.body){
    res.json(res.body)
    return
  }
  fs.createReadStream(req.filePath).pipe(res)
}

function setDirDetails(req, res, next){
  let filePath = req.filePath
  let endsWithSlash = filePath.charAt(filePath.length - 1) === path.sep
  let hasExt = path.extname(filePath) !== ''
  req.isDir = endsWithSlash || !hasExt
  req.dirPath = req.isDir ? filePath : path.dirname(filePath)
  next()
}

function* setFileMeta(req, res, next){

    req.filePath = path.resolve(path.join(ROOT_DIR, req.url))
    if (req.filePath.indexOf(ROOT_DIR) !== 0){
      res.send(400, 'Invalid path')
      return
    }
    try {
        req.stat = yield fs.promise.stat(req.filePath)
    } 
    catch(e){
        req.stat = null
    }
    next()
}

function* sendHeaders(req, res, next) {

    if(req.stat.isDirectory()){
      // is a dir
      let files = yield fs.promise.readdir(req.filePath) 
      res.body = JSON.stringify(files)
      res.setHeader('Content-Length', res.body.length)
      res.setHeader('Content-Type', 'application/json')
    }
    else{
      // is a file
      res.setHeader('Content-Length', req.stat.size)
      let contentType = mime.contentType(path.extname(req.filePath))
      res.setHeader('Content-Type', contentType)
    }
    next()
}

module.exports = main
