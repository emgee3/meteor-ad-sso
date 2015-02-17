SSO = {};

var authId = Meteor.uuid();
var timesRefreshed = new ReactiveVar();

Template.adsso.helpers ({
  authQueryString : function () {
    // Build the URL for the iframe
    var env = __meteor_runtime_config__.ROOT_URL;
    var isProd = env.indexOf('localhost') === -1 && env.indexOf('127.0') === -1;

    return (isProd ? SSO.authUrl + SSO.authApp : SSO.devAuthUrl + SSO.devAuthApp)
              + "/" + authId;
  }
});


Template.adsso.rendered = function () {
  timesRefreshed.set(0);

  $("iframe").load(function(){
    timesRefreshed.set(timesRefreshed.get() + 1);
  });
};


Tracker.autorun(function () {
  if (timesRefreshed.get() > 0) {
    Accounts.callLoginMethod({
      methodArguments: [
        { authId : authId }
      ]
    });
  }
});
