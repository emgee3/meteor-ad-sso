Package.describe({
  name : "emgee:ad-sso",
  summary: "Active Directory SSO",
  version: "0.2.1",
  git: "https://github.com/emgee3/meteor-ad-sso.git",
  documentation: "README.md"
});

Npm.depends({
  "body-parser": "1.14.2"
});

Package.onUse(function (api) {
  api.versionsFrom("METEOR@1.2.1");

  api.use("jquery", "client");

  api.use("underscore", "server");
  api.use("meteorhacks:picker@1.0.3");

  api.use("accounts-base", ["client", "server"]);

  api.addFiles("adsso-client.js", "client");
  api.addFiles("adsso-server.js", "server");

  api.export("SSO", ["client", "server"]);
});

