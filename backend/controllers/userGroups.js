const UserGroup = require('../models/userGroup');
const _ = require('lodash');
// const q = require('q');

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

    const currentGroup = req.group;
    delete group._id;
    _.extend(currentGroup, group);

    group.update(group).then(g => res.status(200).send(g),
        err => res.status(500).send(err));
};

function remove(req, res){
    const currentGroup = req.group;
    currentGroup.status = 'removed';

    currentGroup.update(currentGroup).then(g => res.status(200).send(g),
        err => res.status(500).send(err));
};

module.exports = {
    all,create,update,remove
}