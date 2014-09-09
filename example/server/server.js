
if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
}


Meteor.methods({
  'click' : function () {
    console.log(SSO);
  },
  'clack' : function () {
    console.log(Accounts);
  }
});


Accounts.onLoginFailure(function () {
  console.log(arguments);
});

Accounts.onLogin(function () {
  console.log(arguments);
});
