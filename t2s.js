// config
var yaml = require('node-yaml');
var config = yaml.readSync('./config.yml');
config.port = config.port || 8080;

// server
var express = require('express');
var app = express();

var morgan = require('morgan');
app.use(morgan('dev', {immediate: true}));

var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

function send(data) {
  var request = require('request');
  data.channel = config.slack.channel;
  request({
    uri: config.slack.webhook,
    method: 'POST',
    json: data
  });
}

function send_update(data) {
  var username = data.username;
  var screenname = data.screenname;
  var icon = data.icon;
  var text = data.text;
  var payload = {
    "icon_url": `${icon}`,
    "username": `${username} ${screenname}@twitter.com`,
    "text": `${text}`
  };
  send(payload);
}

// routes
app.get('/', (req, res) => {
  res.send('Hi Spam');
});

app.post('/', (req, res) => {
  var data = req.body;
  if (data.event_type == 'update') {
    send_update(data.data);
  }
  res.send('OK');
});

// starting
app.listen(config.port, () => {
  console.log(`Listen on ${config.port}`);
});
