#Active Directory SSO for Meteor

Active Directory Single Sign On Authentication and Authorization for Meteor

##Meteor package

### Installation

    meteor add emgee:ad-sso

###Configuration
There is some config required on the client and server.

######server/sso.js

    SSO.debug        = false;
    SSO.createUsers  = true;
    SSO.getUserProps = Meteor.wrapAsync(getUserProps)
    SSO.serverToken = "5c292f53-3e7e-4d65-89f6-6f316d9b26df";

    function getUserProps (opts, cb) {
      opts = opts || {};
      var userdata = HTTP.get("url", { params : { domain : opts.domain, user : opts.username } });
      if (userdata.data.admin) return cb(null, { admin : true });
      return cb(null, {});
    }

`SSO.debug` adds `console.log`ing and may be useful when debugging.

`SSO.createUsers` is a boolean flag that sets whether or not the Meteor application will
automatically create a Meteor Account for an Active Directory user logging in for the first time.
Usernames are set to `domain/username` and at this time it is a requirement.

If this is set to true, any user with a valid Active Directory account can make an account on
the Meteor server.

`SSO.getUserProps` is an optional function that is called when an authenticated user logs into
a Meteor application for the first time. You can use this to set additional properties, such as
administrative rights. If this is an async function, wrap with with `Meteor.wrapAsync(...)`.

`SSO.serverToken` is a string that the IIS module provides, which prevents a HTTP posts from an
attacker.

######client/sso.js

    SSO.devAuthUrl = "http://dev.windows.domain/auth";
    SSO.authUrl    = "http://windows.domain/auth";
    SSO.devAuthApp = "dev";
    SSO.authApp    = "messaging";

The IIS component communicates with the Meteor server via HTTP POST, and supports authetication
to multiple Meteor applications simultaneously. Set the above strings to determing which Meteor
server to POST to.

##License
MIT
