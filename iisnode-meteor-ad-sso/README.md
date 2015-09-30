# Active Directory SSO for Meteor

Active Directory Single Sign On Authentication and Authorization for Meteor

### IIS SSO component

This component runs inside Internet Information Server on a Microsoft Windows
domain. It uses Tomasz Janczuk's [iisnode](https://github.com/tjanczuk/iisnode) to integrate the node
process with IIS. IIS handles Windows Authentication using the negotiate protocol.
Once this authentication is complete, the authenticated user information and a token
will be passed to the appropriate Meteor server.

The same iisnode component may serve multiple Meteor applications.

## Install

* Install IIS and iisnode ([instructions](https://github.com/tjanczuk/iisnode#hosting-nodejs-applications-in-iis-on-windows))
* Install the IIS rewrite module if not already done.
* Get the iisnode component folder into a directory on the IIS server (e.x. `npm install meteor-ad-sso` )
* Configure `config.json` as instructed below
* Adjust any firewalls needed. IIS server must be able to HTTP post to Meteor server
* From the IIS manager, add a new site and point it to the iisnode folder.
* Configure IIS to require Windows Authentication and disable Anonymous Authentication.

![Screenshot of Windows Authentication](https://raw.githubusercontent.com/emgee3/meteor-ad-sso/master/iisnode-meteor-ad-sso/screenshot.png)

## Configuration

Configuration is set in `config.json`.

    {
      "basePath" : "auth",
      "apps" : {
        "default"   : "http://10.0.100.1:3000/ssoauth",
        "messaging" : "http://10.0.100.2:3000/ssoauth"
      },
      "debug" : false,
      "serverToken" : "A unique string to authenticate the HTTP POST sent by the server. PLEASE CHANGE THIS!!!"
    }

`basePath` is used to determine the iisnode path. Adjust this to avoid path conflicts as needed.

`apps` is an object used to determine which Meteor server to notify when a successful Windows
Authentication has been established. Each app should have a unique name, and a path to that
Meteor app, to notify it.

`debug` enables some `console.log`ing which can be viewed at `http://server/basepath/iisnode`.

`serverToken` is a string that the Meteor server checks, which prevents a HTTP posts from an attacker.

## License
MIT
