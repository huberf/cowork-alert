//Getting all dependencies
var express = require('express.io');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var app = express();
var bodyParser = require('body-parser');
var http = require('http').Server(app);
var io = require('socket.io')(http);

//Load twilio module
var twilio = require('twilio');
const twilioUser = process.env.TWILIO_USER;
const twilioPass = process.env.TWILIO_PASS;
var client = new twilio.RestClient(twilioUser, twilioPass);

app.http().io()

//Setting up the port to listen to
app.set('port', (process.env.PORT || 3000));

//Setting up the resource directory
app.use(express.static(__dirname + '/public'));

app.use( bodyParser.urlencoded({ extended: false }));
app.use( bodyParser.json());

//Setting up cookie use
app.use(cookieParser());

//Setting up session handling
app.use(session({secret: 's3cr3tsSh0uldB3K3pt'}));

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');


app.get('/', function(req, res) {
	res.end('Hackster-Hsv api');
});

function sendMessage(recipient, message) {
  client.sms.messages.create({
    to: recipient,
    from: '+19312288468',
    body: message
  }, function(err, mess) {
    if(err) {
      console.log('An error occured: ' + err);
    } else {
      console.log('!Message sent!');
    }
  });
}

var recipients = [process.env.MAIN_SMS];

app.get('/api/v1/alert', function(req, res) {
  for(var i = 0; i < recipients.length; i++) {
    sendMessage(recipients[i], 'The door must be opened.');
  }
  res.send('success');
});

app.get('/api/v1/recipients', function(req, res) {
  res.send(recipients);
});

io.sockets.on('connection', function(socket) {
	socket.on('test', function(data) {
		socket.emit('test', "Hello world!");
	});
});

http.listen(app.get('port'), function() {
  console.log('Node app is running on port ', app.get('port'));
});

