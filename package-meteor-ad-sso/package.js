Package.describe({
  name : "emgee:ad-sso",
  summary: "Active Directory SSO",
  version: "0.1.4",
  git: "https://github.com/emgee3/meteor-ad-sso.git",
  documentation: "README.md"
});

Npm.depends({ "chalk" : "1.0.0" });

Package.onUse(function (api) {
  api.versionsFrom("METEOR@1.0.3.1");
  api.versionsFrom("METEOR@1.0.4.2");
  api.versionsFrom("METEOR@1.1.0.2");

  api.use("templating", "client");
  api.use("jquery", "client");
  api.use("session", "client");
  api.use("tracker", "client");
  api.use("reactive-var", "client");

  api.use("underscore", "server");
  api.use("iron:router@1.0.9");

  api.use("accounts-base", ["client", "server"]);

  api.addFiles("adsso.html", "client");
  api.addFiles("adsso.css", "client");
  api.addFiles("adsso-client.js", "client");

  api.addFiles("adsso-server.js", "server");

  api.export("SSO", ["client", "server"]);
});

