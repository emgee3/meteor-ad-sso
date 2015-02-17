Package.describe({
  name : "emgee:ad-sso",
  summary: "Active Directory SSO",
  version: "0.1.0",
  git: "https://github.com/emgee3/meteor-ad-sso.git"
});

Npm.depends({ "chalk" : "0.5.1" });

Package.on_use(function (api) {
  api.versionsFrom("METEOR@1.0.3.1");

  api.use("iron:router@1.0.7");

  api.use(["templating", "jquery", "session", "tracker", "reactive-var"], "client");
  api.use("underscore", "server");

  api.use("accounts-base", ["client", "server"]);

  api.add_files(["adsso-client.js", "adsso.css", "adsso.html"], "client");
  api.add_files("adsso-server.js", "server");

  api.export("SSO", ["client", "server"]);
});

