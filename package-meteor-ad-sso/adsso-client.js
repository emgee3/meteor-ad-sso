SSO = {};

var authId = Meteor.uuid();

Meteor.startup(function () {
  var env = __meteor_runtime_config__.ROOT_URL;
  var isProd = env.indexOf('localhost') === -1 && env.indexOf('127.0') === -1;

  var src = (isProd ? SSO.authUrl + SSO.authApp : SSO.devAuthUrl + SSO.devAuthApp) + "/" + authId + "?q=" + Random.id();

  var $iframe = $('<iframe></iframe>')
    .attr('style', 'display: none')
    .attr('src', src)
    .load(function () {
      if (Meteor.user()) return;
      SSO.login();
    });

  $('body').append($iframe);
});


SSO.login = function () {
  Accounts.callLoginMethod({
    methodArguments: [
      { authId : authId }
    ],
    userCallback : function (err, res) {
      if (err) {
        if (typeof SSO.onError === "function")  {
          SSO.onError(err);
        } else {
          console.error(err);
        }
      } else {
        if (typeof SSO.onSuccess === "function") SSO.onSuccess(res);
      }
    }
  });
}
