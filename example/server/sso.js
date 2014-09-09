SSO.debug        = true;
SSO.createUsers  = true;
SSO.getUserProps = function (opts) {
  opts = opts || {};
  console.log('called');
  // var userdata = HTTP.get("url", { params : { domain : opts.domain, user : opts.username } });
  // if (userdata.data.admin) return { admin : true };
  return { admin : true, profile : { name : opts.username.toUpperCase() } };
}
SSO.serverToken = "5c292f53-3e7e-4d65-89f6-6f316d9b26df";
