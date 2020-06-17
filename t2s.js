const fs = require('fs');

// config
var config = {}
if (fs.existsSync('./config.yml')) {
  var yaml = require('node-yaml');
  config = yaml.readSync('./config.yml');
} else {
  config = {
    port: process.env.PORT || 0,
    slack: {
      channel: process.env.SLACK_CHANNEL,
      webhook: process.env.SLACK_WEBHOOK
    }
  };
}

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
  if (data.media) {
    text += `\n:heavy_plus_sign: ${data.media}`;
  }
  if (data.urls) {
    for (var i = 0; i < data.urls.length; ++i) {
      text = text.replace(data.urls[i].url, data.urls[i].expanded_url);
    }
  }
  var payload = {
    "icon_url": `${icon}`,
    "username": `${username} @${screenname}@twitter.com`,
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
