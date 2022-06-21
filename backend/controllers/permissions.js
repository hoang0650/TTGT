const UserGroup = require('../models/userGroup');
const {User} = require('../models/user')
const config = require("../config/configure");
const _ = require('lodash');
const { result } = require('lodash');


function getPermissions(req,res,next){
    if(!req.notNeedAuth){
        const userId = req.user.sub;
        if(!userId){
            return res.status(401).end();
        }
        const query ={
            users: userId,
            status: {$ne: 'removed'}
        };
        UserGroup.find(query).exec((err,groups)=>{
            if(err){
                return res.status(500).end();
            }
            const rolesSet = {};
            const roles = {};
            groups.forEach(group =>{
                const permissions = group.permissions;
                for (const k in permissions){
                    if(permissions.hasOwnProperty(k)){
                        rolesSet[k] = rolesSet[k] || new Set();
                        if(permissions[k] !== 'none'){
                            rolesSet[k].add(permissions[k]);
                        }
                    }
                }
            });
            for (let k in rolesSet){
                roles[k] = Array.from(rolesSet[k]);
            }
            req.permissions = roles;
            return next();
        },()=>{
            return res.status(500).end();
        });
    } else{
        return next();
    }
}

// function checkPermissions(permissions){
//     return (req,res,next)=>{
//         const userPermissions = req.user['https://hoang0650.com/app_metadata'].permissions;
//         userPermissions.permissions = req.body.permissions;
//         console.log('userPermissions',userPermissions.permissions);
//         if(!req.body.permissions){
//             return res.status(401).json({err:'You have no permissions!!!'});
//         }
//         const checker = _.isEqual(req.body.permissions, permissions);
//         if(checker) next();
//     };
// };

function checkRoles(allowedRoles){
    return (req,res,next) =>{
        
        if(allowedRoles == null || allowedRoles.length === 0){
            return res.status(401).end();
        }

        const userId = req.user.sub;
        User.findOne({userId:userId})
        .then((user) => {
            if (user) {
                const checkRoles = user.roles || ['guest']
                req.user.roles = user.roles || ['guest']
                if(user.blocked){
                    return res.status(403).end()
                }
                if(checkRoles.includes('superadmin') || allowedRoles.includes(checkRoles[0])){
                    return next();
                }
                return res.status(401).end()
            } else {
                return res.status(401).json({})
            }
        })
       .catch((err) => {
           res.status(500).json({ msg: err.message });
       });     
        
    }
    
}

        

function checkPermissions(permissions)
{
    return (req, res, next) => {
    var userPermissions = null
    const query = {
        status: {
            $ne: 'removed'
        }
    };

    const sort = { createdAt: 1 };
    UserGroup
        .find(query)
        .sort(sort)
        .exec()
        .then(groups => {
            var curGroup = null
            groups.forEach(group=>{
                group.users.forEach(user => {
                    if (user == req.user.sub ) {
                        curGroup = group
                        return
                    }
                })
                    if (curGroup) {
                        return
                    }
                })
            if (curGroup) {
                userPermissions = curGroup.permissions || {}
            }

            const checkRoles = req.user.roles || ['guest']
            if(checkRoles.includes('superadmin')){
            return next();
            }

            var permissionAction = ['none', 'read', 'update', 'manage']
            var ok = false
            
            permissions.forEach((permission) => {
            var tmpPermission = permission.split(":")
            if (tmpPermission.length > 1) {
                var userActionLevel = permissionAction.indexOf(userPermissions[tmpPermission[0]])
                var requiredLevel = permissionAction.indexOf(tmpPermission[1])
                if (userActionLevel >= requiredLevel) {
                ok = true
                return
                }
            }
            })
            if(ok){
                return next();
            }

            return res.status(401).end();
        })


  }
}


function checkPermission(permission){
    return checkPermissions([permission]);
}

module.exports = {
    getPermissions,
    checkRoles,
    checkPermissions,
    checkPermission,
}