const AccessControl = require("accesscontrol");
const ac = new AccessControl();
 
exports.roles = (function() {
ac.grant("admin")
 .readOwn("profile")
 .readAny("")
 .updateOwn("profile")
 .updateAny("")
 
 
ac.grant("admin")
 .extend("guest")
 .extend("")
 .deleteOwn("profile")
 .deleteAny("profile")
 
return ac;
})();