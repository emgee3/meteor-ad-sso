var bodyParser = Npm.require("body-parser");

SSO = {};

SSO.AuthTokens = {};

Picker.middleware(bodyParser.json());
Picker.middleware(bodyParser.urlencoded({extended: true}));

// listen for HTTP POST requests on the /ssoauth route
Picker.route('/ssoauth', function(params, req, res, next) {

  log("Incoming Auth Token", req.body);

  if (req.method !== 'POST') {
    log("Only method supported is POST");
    res.writeHead(200, {'Content-Type': 'application/json'});
    res.end("{}");
    return;
  }

  // Verify server token
  if (! req.body.hasOwnProperty('serverToken') ||
      ! req.body.serverToken === SSO.serverToken) {
    log("Missing or invalid ServerToken");
    res.writeHead(200, {'Content-Type': 'application/json'});
    res.end("{}");
    return;
  }

  // iron:router 1.0 compatiblity
  if (req.body.hasOwnProperty('username[0]'))
    req.body.username = [ req.body['username[0]'], req.body['username[1]'] ];

  // Check to make sure token isn't malformed before adding
  if (req.body.hasOwnProperty('authId') &&
      req.body.hasOwnProperty('username')) {
    var token = {
      authId : req.body.authId,
      username : req.body.username,
      authDate : new Date()
    }

    SSO.AuthTokens[req.body.authId] = token;
  }

  // Clean up auth tokens by removing any over 10 minutes old
  var expired = new Date(new Date().getTime() - 10 * 60 * 1000);

  _.each(SSO.AuthTokens, function (token) {
    if (token.authDate < expired) delete SSO.AuthTokens[token.authId];
  });

  res.writeHead(200, {'Content-Type': 'application/json'});
  res.end("{}");
});


// Create a Meteor login handler
// Return undefined to attempt next login handler
// Return null to signify a failed login
// Return an object containing the user's _id for success

Accounts.registerLoginHandler("adsso", function (loginRequest) {

  var userId;

  log("Processing loginRequest", loginRequest);

  loginRequest = loginRequest || {};

  // If the login request doesn't contain an authId property, it's not
  // a SSO login attempt. Return undefined to let Meteor attempt login
  // with a different handler.
  if (! loginRequest.hasOwnProperty("authId")) {
    log("Malformed auth Request", loginRequest);
    return undefined;
  }

  // Check that the authId is in the AuthTokens dictionary
  if (! SSO.AuthTokens.hasOwnProperty(loginRequest.authId)) {
    log("No auth token", loginRequest);
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
    log("Found user account for", domain + "/" + username);
    userId = user._id;

  } else {

    // No Meteor Account has been found. Check if we're supposed to make one
    if (! SSO.createUsers) {
      log("Not creating user account", domain + "/" + username);
      return {
        error : new Meteor.Error("Configured to not create new accounts")
      };
    }

    log("Creating user account for", domain + "/" + username);

    // Create the username we'll use to a
    var accountProps = {
      username : domain + "/" + username
    };

    log("Creating account with settings", accountProps);

    // If there is a custom account property function, use it to extend the
    // account properties.

    if (_.isFunction(SSO.getUserProps)) {

      log("Extending account properties");

      accountProps = _.extend(accountProps, SSO.getUserProps({
        username : username,
        domain : domain
      }));

    } else {
      log("Not extending account properties");
    }

    log("Creating account with", accountProps);

    try {
      userId = Accounts.createUser(accountProps);
    } catch (e) {
      console.error(e);
    }

    log("Account created with ID", userId);

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


function log() {
  if (! SSO.debug) return;

  (console.log).apply(console, arguments);
}
