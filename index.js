var app = require('express')();
var cors = require('cors')
var https = require('https');
var fs = require('fs');

var options = {
  key: fs.readFileSync('/etc/letsencrypt/live/siteexample.com.br/privkey.pem'),
  cert: fs.readFileSync('/etc/letsencrypt/live/siteexample.com.br/cert.pem'),
  ca: fs.readFileSync('/etc/letsencrypt/live/siteexample.com.br/chain.pem')
};
var server = https.createServer(options, app);
var io = require('socket.io')(server);
var port = process.env.PORT || 8080;
var serverPort = 8443;
var bodyParser = require('body-parser');
var corsOptions = {
  origin: 'https://siteexample.com.br',
  credentials: true, 
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}

app.use(cors(corsOptions));
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

app.post('/notificacoes', function(req, res){
  params = req.headers || {};
  if(typeof(params.token) !== 'undefined'){
    if(params.token == 'tokendevalidacao'){//valida quem vai acessar a url para fazer as notificacoes
      if(typeof(req.body.action) !== 'undefined'){        
        res.end(function(){
          io.emit('notificacoes', req.body.action);
        })
      }else{
        console.log("body",JSON.stringify(req.body));
        res.send('A ação não foi passada');
      }
    }else{
      res.send('Token inválido!');
    }
  }else{
    res.send('Token inválido!');
  }
});

app.listen(8080);
server.listen(serverPort, function() {
  console.log('server up and running at %s port', serverPort);
});