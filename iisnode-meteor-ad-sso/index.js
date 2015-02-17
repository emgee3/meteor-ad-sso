//
// Active Directory SSO for Meteor
// © 2014 Mason Gravitt
//

try {
  var config = require('./config');
} catch (e) {
  var config = null;
}

try {
  var path = require('path');
  fs.mkdirSync(path.resolve(__dirname, "iisnode"));
} catch (e) {}

var express = require('express');
var http = require('http');
var util = require('util');
var request = require('request');

var app = express();

if (config) {
  app.get("/" + config.basePath + "/done", function (req, res) {
    res.writeHead(200, { 'Content-Type' : 'application/json' });
    res.end('[]');
    if (config.debug) console.error('Completed authentication');
  });

  app.get("/" + config.basePath + "/:app/:authId", function (req, res) {
    if (! (req.params.app in config.apps) ||
        ! req.params.app ||
        ! req.params.authId ) {
      if (config.debug) console.error('Missing app name or malformed request',
                          JSON.stringify(req.params));
      res.writeHead(500);
      res.end();
      return;
    }

    if (config.debug) console.error("Successful authentication from",
      JSON.stringify({ headers : req.headers, params : req.params }));

    var opts = {};
    opts.username = req.headers['x-iisnode-auth_user'].split("\\");
    opts.authId   = req.params.authId;
    opts.serverToken = config.serverToken;

    request.post(config.apps[req.params.app], { form : opts }, function (err, result) {
      if (err) {
        res.writeHead(500);
        if (config.debug) {
          res.end();
          console.error(err);
        } else {
          res.end();
        }
      } else {
        if (config.debug) console.error('Redirecting to done path');
        res.redirect("/" + config.basePath + "/done");
      }
    });
  });

} else {
  // If not configured, mention this
  app.get("/", function (req, res) {
    res.writeHead(200, { "Content-Type" : "text/html" });
    res.end("Application unconfigured");
    console.error("Application unconfigured")
  });
}

app.listen(process.env.PORT);

