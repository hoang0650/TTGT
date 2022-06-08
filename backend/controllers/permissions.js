const UserGroup = require('../models/userGroup');
const config = require("../config/configure");
const _ = require('lodash');


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

function checkPermissions(permissions)
{
    return (req, res, next) => {
     const userId = req.user.sub;
     const query = {
         id: userId,
         permissions: {$eq: permissions}
     }

     UserGroup.find(query).exec((err,result)=>{
        if(err) {
            return res.status(401).json({err});
        }
        
        return next();
     })}
}

function checkPermission(permission){
    return checkPermissions([permission]);
}

module.exports = {
    getPermissions,
    checkPermissions,
    checkPermission,
}