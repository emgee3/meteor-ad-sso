//
// Active Directory SSO for Meteor
// © 2014 Mason Gravitt
// MIT licensed
//

SSO = {};

SSO.AuthTokens = {};

// listen for HTTP POST requests on the /ssoauth route
Router.route('/ssoauth', { where: 'server', name : "ssoauth" })
  .post(function () {

  if (SSO.debug) console.log("Incoming Auth Token\n", this.request.body, "\n\n");

  // Verify server token
  if (! this.request.body.hasOwnProperty('serverToken') ||
      ! this.request.body.serverToken === SSO.serverToken) {
    if (SSO.debug) console.log("Missing or invalid ServerToken\n");
    this.response.writeHead(200, {'Content-Type': 'application/json'});
    this.response.end("{}");
    return;
  }

  // iron:router 1.0 compatiblity
  if (this.request.body.hasOwnProperty('username[0]'))
    this.request.body.username = [ this.request.body['username[0]'], this.request.body['username[1]'] ];

  // Check to make sure token isn't malformed before adding
  if (this.request.body.hasOwnProperty('authId') &&
      this.request.body.hasOwnProperty('username')) {
    var token = {
      authId : this.request.body.authId,
      username : this.request.body.username,
      authDate : new Date()
    }

    SSO.AuthTokens[this.request.body.authId] = token;
  }

  // Clean up auth tokens by removing any over 10 minutes old
  var expired = new Date(new Date().getTime() - 10 * 60 * 1000);

  _.each(SSO.AuthTokens, function (token) {
    if (token.authDate < expired) delete SSO.AuthTokens[token.authId];
  });

  this.response.writeHead(200, {'Content-Type': 'application/json'});
  this.response.end("{}");
});


// Create a Meteor login handler
// Return undefined to attempt next login handler
// Return null to signify a failed login
// Return an object containing the user's _id for success

Accounts.registerLoginHandler("adsso", function (loginRequest) {

  var userId;

  if (SSO.debug) console.log("Processing loginRequest:", JSON.stringify(loginRequest), "\n");

  loginRequest = loginRequest || {};

  // If the login request doesn't contain an authId property, it's not
  // a SSO login attempt. Return undefined to let Meteor attempt login
  // with a different handler.
  if (! loginRequest.hasOwnProperty("authId")) {
    if (SSO.debug) console.log("Malformed auth Request\n");
    return undefined;
  }

  // Check that the authId is in the AuthTokens dictionary
  if (! SSO.AuthTokens.hasOwnProperty(loginRequest.authId)) {
    if (SSO.debug) console.log("No auth token\n");
    return undefined;
  }

  // Parse username and domain
  var userAccount = SSO.AuthTokens[loginRequest.authId].username;
  var domain = userAccount[0].toLowerCase();;
  var username = userAccount[1].toLowerCase();;

  // Remove the token as it's no longer needed
  delete SSO.AuthTokens[loginRequest.authId];

  // Check if the user already has an existing Meteor Account
  var user = Meteor.users.findOne({
    username : domain + "/" + username
  });

  // If a user accounte exists, look up the user's _id
  if (user) {
    if (SSO.debug) console.log("User account for", domain, "/", username, "found\n");
    userId = user._id;

  } else {

    // No Meteor Account has been found. Check if we're supposed to make one
    if (! SSO.createUsers)
      return {
        error : new Meteor.Error(401, "Configured to not create new accounts")
      };

    if (SSO.debug) console.log("Creating user account for", domain, "/", username, "\n");

    // Create the username we'll use to a
    var accountProps = {
      username : domain + "/" + username
    };

    // If there is a custom account property function, use it to extend the
    // account properties.
    if (SSO.getUserProps) {
      accountProps = _.extend(accountProps, SSO.getUserProps({
        username : username,
        domain : domain
      }));
    }

    if (SSO.debug) console.log("Creating account with", JSON.stringify(accountProps), "\n");

    userId = Accounts.createUser(accountProps);

    // Not all the properties were added to the user account. Delete the ones added.
    delete accountProps.username;
    if (accountProps.hasOwnProperty('profile'))
      delete accountProps.profile;

    // Add the remaining properties, if any.
    _.each(accountProps, function (v, k) {
      var prop = {};
      prop[k] = v;
      Meteor.users.update(userId, { "$set" : prop });
    });
  }

  return {
    userId: userId
  };
});

Router.onBeforeAction(Iron.Router.bodyParser.urlencoded({
  extended: false
}));
