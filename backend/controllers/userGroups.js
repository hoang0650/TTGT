const UserGroup = require('../models/userGroup');
const _ = require('lodash');
// const q = require('q');
const ManagementClient = require("auth0").ManagementClient;
const config = require("../config/configure");
const clientConfig = config.auth0ManagementClient;
const management = new ManagementClient({

  domain: clientConfig.domain,
  token: clientConfig.token,
  scope: 'read:users update:users delete:users create:users'
});

function all(req, res){
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
        .then(groups => res.json(groups), () => res.status(404).end());
};

function create(req, res){

    req.body.users = req.body.users.map(user => {
        return user.user_id;
    });
    const group = new UserGroup(req.body);

    group.creator = {
        email: req.user.email,
        name: req.user.name,
        user_id: req.user.sub
    };

    group.save().then(g => res.status(200).send(g),
    err => res.status(500).send(err));
};

function update(req, res){

    req.body.users = req.body.users.map(user => {
        return user.user_id;
    });
   
    const group = new UserGroup(req.body);
    group.creator = {
        email: req.user.email,
        name: req.user.name,
        user_id: req.user.sub
    };

    delete group._id;
    
    group.update(group).then(g => res.status(200).send(g)).catch(err => res.status(500).send(err));
        
};

function remove(req, res){
    const currentGroup = req.group;
    currentGroup.status = 'removed';

    currentGroup.update(currentGroup).then(g => res.status(200).send(g),
        err => res.status(500).send(err));
};

function getUserPermissions(req, res){
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
                return res.status(200).json(curGroup.permissions)
            }

            return res.status(204).json([])
        }
            , () => res.status(404).end());
};

module.exports = {
    all,create,update,remove,getUserPermissions
}