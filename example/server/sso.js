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
