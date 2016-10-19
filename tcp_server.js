let chokidar = require('chokidar');
let net = require('net'),
    JsonSocket = require('json-socket');


let watcher = chokidar.watch('./foo', {
  ignored: /[\/\\]\./,
  ignoreInitial: true,
  persistent: true
});

let port = 8001;
let server = net.createServer();
server.listen(port,  ()=>console.log(`TCP Server LISTENING @ http://127.0.0.1:${port}`));
server.on('connection', function(socket) { //This is a standard net.Socket
    socket = new JsonSocket(socket); //Now we've decorated the net.Socket to be a JsonSocket
    watcher.on('ready', () => log('Initial scan complete. Ready for changes')) 
           .on('add', path => {
               console.log(`File ${path} has been added`)
               socket.sendMessage({
                        "action": "write",                          
                        "path": path,
                        "type": "file",                               
                        "updated": Math.round((new Date()).getTime() / 1000)                    
                })
              })

           .on('addDir', path => {
               console.log(`Directory ${path} has been added`)
               socket.sendMessage({
                        "action": "write",                          
                        "path": path,
                        "type": "dir",                               
                        "updated": Math.round((new Date()).getTime() / 1000) 
                })
              })
           .on('unlink', path => {
               console.log(`File ${path} has been removed`)
               socket.sendMessage({
                        "action": "delete",                          
                        "path": path,
                        "type": "file",                               
                        "updated": Math.round((new Date()).getTime() / 1000) 
                })
              })
           .on('unlinkDir', path => {
               console.log(`Directory ${path} has been removed`)
               socket.sendMessage({
                        "action": "delete",                          
                        "path": path,
                        "type": "dir",                       
                        "updated": Math.round((new Date()).getTime() / 1000) 
                })
              })
           .on('change', path => {
               console.log(`File ${path} has been changed`)
               socket.sendMessage({
                        "action": "update",                          
                        "path": path,
                        "type": "file",                       
                        "updated": Math.round((new Date()).getTime() / 1000) 
                })
              })

});
