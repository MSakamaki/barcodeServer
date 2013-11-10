
var  serverR = require('websocket.io').listen(8080, function(){
	console.log('websocket resouce server start');
});
var  serverC = require('websocket.io').listen(8081, function(){
    console.log('websocket client server start');
});
var  serverM = require('websocket.io').listen(8083, function(){
    console.log('websocket mobile server start');
});
var restify = require('restify');
var wsResouce = { };
var wsClient = { };
var wsMobile = { };

/* WebSocket Server(resouce and client) */
serverR.on('connection', function(socket){
    console.log('websocket resouce server connect');
    wsResouce.send = function(fnc){fnc(socket);}
});
serverC.on('connection', function(socket){
    console.log('websocket client server connect');
    socket.on('message', function(data) {
        console.log('client -> res msg:' + data);
       serverR.clients.forEach(function(client){
            if(client){
                console.log('_ws send');
                client.send(data);
            }
        });
    });
});
serverM.on('connection', function(socket){
    console.log('websocket mobile server connect');
    wsMobile.send = function(fnc){fnc(socket);}
    socket.on('message', function(event){
    console.log(event);
    });
});


/* REST module*/
var restServer = restify.createServer();
restServer.use(
    function crossOrigin(req,res,next){
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "X-Requested-With");
        return next();
    }
);

restServer.get('/get/:name', function(req, res, next){
    console.log('/get', req.params.name);
    wsResouce.send(function(_ws){
        serverR.clients.forEach(function(client){
            if(client){
                console.log('_ws send');
                client.send(JSON.stringify(
                    { name : req.params.name }
                ));
            }
        });
        console.log('_ws res send');
        //res.send(JSON.stringify({nane : req.params.ID+" DETH"}));
        var dataX = _ws.on('message', function(event){
            console.log('message', event);
            var data = JSON.parse(event);
            try{
                res.send(JSON.parse(event));
            }catch(e){ console.log('err:',e);}
        });
        /*_ws.onmessage = function(event){
            console.log('message', event);
        };*/
        console.log('dataX: end');
        //res.send({id:123});
    });
});
restServer.listen(8082, function() {
    console.log('listening at ', restServer.name, restServer.url);
});


