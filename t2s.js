const fs = require("fs");
const crypto = require("crypto");
const subprocess = require("child_process");
const NodeCache = require("node-cache");

// config
var config = {};
if (fs.existsSync("./config.yml")) {
  var yaml = require("node-yaml");
  config = yaml.readSync("./config.yml");
} else {
  config = {
    port: process.env.PORT || 0,
    twitter: {
      hidden_reply: true
    },
    slack: {
      channel: process.env.SLACK_CHANNEL,
      webhook: process.env.SLACK_WEBHOOK
    }
  };
}

// server
var express = require("express");
var app = express();

var morgan = require("morgan");
app.use(morgan("dev", { immediate: true }));

var bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

function send(data) {
  var request = require("request");
  data.channel = config.slack.channel;
  request({
    uri: config.slack.webhook,
    method: "POST",
    json: data
  });
}

function md5(text) {
  return crypto.createHash("md5").update(text).digest("hex");
}

var iconcache = new NodeCache({ maxKeys: 1000 });

function random_icon(seed) {
  var icon = iconcache.get(seed);
  if (icon) {
    return icon;
  }
  var icons = fs.readFileSync('./icons.txt', {encoding:'utf8', flag:'r'}).trim().split("\n");
  var idx = (Math.random() * icons.length) | 0;
  var icon = icons[idx];
  iconcache.set(seed, icon);
  return icon;
}

function send_update(data) {
  var username = data.username;
  var screenname = data.screenname;
  var username_hashed = md5(
    `${new Date().getDay()} ${username} @${screenname}@twitter.com`
  );
  var icon = random_icon(username_hashed); //data.icon;
  var text = data.text;
  if (text[0] == '@' && config.twitter.hidden_reply) {
    return;
  }
  if (data.entities) {
    if (data.entities.media) {
      for (var media of data.entities.media) {
        text = text.replace(media.url, "");
        text += `\n:heavy_plus_sign: ${media.media_url_https}`;
      }
    }
    if (data.entities.urls) {
      for (var url of data.entities.urls) {
        text = text.replace(url.url, url.expanded_url);
      }
    }
  }
  var payload = {
    icon_emoji: `${icon}`,
    username: username_hashed,
    text: `${text}`,
    unfurl_links: true
  };
  send(payload);
}

// routes
app.get("/", (req, res) => {
  res.send("Hi Spam");
});

app.post("/", (req, res) => {
  var data = req.body;
  if (data.event_type == "update") {
    send_update(data.data);
  }
  res.send("OK");
});

// starting
app.listen(config.port, () => {
  console.log(`Listen on ${config.port}`);
});
