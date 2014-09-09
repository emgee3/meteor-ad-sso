//
// Active Directory SSO for Meteor
// © 2014 Mason Gravitt
// MIT licensed
//

SSO = {};

Session.setDefault("adsso.authId", Meteor.uuid());
Session.setDefault("adsso.timesRefreshed", 0);



Template.adsso.authQueryString = function () {
  // Build the URL for the iframe
  var env = __meteor_runtime_config__.ROOT_URL;
  var url;

  if (env.indexOf('localhost') === -1 && env.indexOf('127.0') === -1) {
    url = SSO.authUrl + SSO.authApp + "/" + Session.get("adsso.authId");
  } else {
    url = SSO.devAuthUrl + SSO.devAuthApp + "/" + Session.get("adsso.authId");
  }

  return url;
};


Template.adsso.rendered = function () {
  Session.set('adsso.timesRefreshed', 0);

  $("iframe").load(function(){
    Session.set("adsso.timesRefreshed", Session.get("adsso.timesRefreshed") + 1);
  });
};


Tracker.autorun(function () {
  if (Session.get("adsso.timesRefreshed") > 0)
    Accounts.callLoginMethod({
      methodArguments: [
        { authId : Session.get("adsso.authId") }
      ],
      userCallback: function() { /* no-op, maybe not still needed */ }
    });
});
