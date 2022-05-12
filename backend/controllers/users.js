const config = require('../config/configure');
const {User} = require('../models/user');
const {Camera} = require('../models/camera');
const Parking = require('../models/parking');
const _ = require('lodash');
const q = require('q');
const consul = require('consul')({ host: config.consulHost });

const compare = function (a, b) {
    if (a.hTime < b.hTime) {
        return 1;
    }
    else if (a.hTime > b.hTime) {
        return -1;
    }
    else {
        return 0;
    }
};

const onlyReturnFavorite = function (oUser) {
    const user = JSON.parse(JSON.stringify(oUser));
    if (oUser) {
        if (user.favorite && user.favorite.length > 0) {
            const listFavorite = [];
            user.favorite.forEach(function (fav) {
                if (fav.fStatus) {
                    listFavorite.push(fav);
                }
            }, this);
            user.favorite = listFavorite;
        }
        user.history.sort(compare);
        user.history = _.take(user.history, 20);
    }
    return user;
};

const existInCamera = function (_id) {
    const defer = q.defer();
    Camera.findOne({
        _id: _id
    }).exec((err, existObject) => {
        if (err) {
            defer.reject(err);
        } else {
            defer.resolve(existObject);
        }

    });
    return defer.promise;
};
const existInParking = function (_id) {
    const defer = q.defer();
    Parking.findOne({
        _id: _id
    }).exec((err, existObject) => {
        if (err) {
            defer.reject(err);
        } else {
            defer.resolve(existObject);
        }

    });
    return defer.promise;
};

const checkExistInDb = function (type, id) {
    const defer = q.defer();
    if (type === 'camera') {
        existInCamera(id).then(existObject => {
            if (existObject) {
                defer.resolve(existObject);
            } else {
                defer.reject();
            }
        }, err => {
            defer.reject(err);
        });
    } else if (type === 'parking') {
        existInParking(id).then(existObject => {
            if (existObject) {
                defer.resolve(existObject);
            } else {
                defer.reject();
            }
        }, err => {
            defer.reject(err);
        });
    }
    return defer.promise;
};

function findOneByUserId(req, res) {
    const userId = req.user.sub;
    User.findOne({
        userId: userId
    }).exec((err, user) => {
        if (err) {
            return res.status(500).end();
        }
        const customUser = onlyReturnFavorite(user);
        if (customUser) {
            consul.kv.get('dev_camera/refreshTime', function (err, result) {
                if (!err && result && result.Value) {
                    customUser.cameraRefreshTime = result.Value;
                } else {
                    customUser.cameraRefreshTime = config.cameraRefreshTime;
                }
                res.status(200).json(customUser);
            });

        }
    });
};


function addHistory(req, res) {
    const userId = req.user.sub;
    if (!req.body.hId || !req.body.hViewTime || !req.body.hType) {
        return res.status(500).end();
    }
    checkExistInDb(req.body.hType, req.body.hId).then((existObject) => {
        User.findOne({
            userId: userId
        }).exec((err, user) => {
            if (err) {
                return res.status(500).end();
            } else {
                if (user) {
                    const indexHistory = _.findIndex(user.history, ['hId', req.body.hId]);
                    if (indexHistory > -1) {
                        user.history[indexHistory].hValues.countVisited++;
                        user.history[indexHistory].hTime = new Date();
                        user.history[indexHistory].hValues.viewTime = user.history[indexHistory].hValues.viewTime + Number.parseInt(req.body.hViewTime);
                    } else {
                        user.tmpHistory = {
                            hValues: { countVisited: 1, viewTime: Number.parseInt(req.body.hViewTime) }
                        };
                        _.extend(user.tmpHistory, req.body);
                        user.tmpHistory.hName = existObject.name;
                        user.tmpHistory.hTime = new Date();
                        user.history.push(user.tmpHistory);
                    }
                    user.update(user).then(() => {
                        User.findOne({
                            userId: userId
                        }).exec((err, user) => {
                            if (err) {
                                return res.status(200).end();
                            } else {
                                res.status(200).json(onlyReturnFavorite(user));
                            }
                        });
                    }, () => {
                        req.status(500).end();
                    });
                } else {
                    const newUser = new User();
                    newUser.userId = req.user.sub;
                    newUser.tmpHistory = {
                        hValues: { countVisited: 1, viewTime: Number.parseInt(req.body.hViewTime) }
                    };
                    _.extend(newUser.tmpHistory, req.body);
                    newUser.tmpHistory.hName = existObject.name;
                    newUser.tmpHistory.hTime = new Date();
                    newUser.history.push(newUser.tmpHistory);
                    newUser.save().then(u => res.status(200).json(onlyReturnFavorite(u)));
                }
            }
        });
    }, () => {
        res.status(500).send('Not exist data');
    });
};

function addFavorite(req, res) {
    const userId = req.user.sub;
    if (!req.body.fId) {
        return res.status(500).end();
    }
    checkExistInDb(req.body.fType, req.body.fId).then((existObject) => {
        User.findOne({
            userId: userId
        }).exec((err, user) => {
            if (err) {
                return res.status(500).end();
            } else {
                if (user) {
                    const indexFavorite = _.findIndex(user.favorite, ['fId', req.body.fId]);
                    if (indexFavorite > -1) {
                        user.favorite[indexFavorite].fStatus = !user.favorite[indexFavorite].fStatus;
                        user.favorite[indexFavorite].fTime = new Date();
                    } else {
                        _.extend(user.tmpFavorite, req.body);
                        user.tmpFavorite.fStatus = true;
                        user.tmpFavorite.fName = existObject.name;
                        user.tmpFavorite.fTime = new Date();
                        user.favorite.push(user.tmpFavorite);
                    }
                    user.update(user).then(() => {
                        User.findOne({
                            userId: userId
                        }).exec((err, user) => {
                            if (err) {
                                return res.status(200).end();
                            } else {
                                res.status(200).json(onlyReturnFavorite(user));
                            }
                        });
                    }, () => {
                        req.status(500).end();
                    });
                } else {
                    const newUser = new User();
                    newUser.userId = req.user.sub;
                    _.extend(newUser.tmpFavorite, req.body);
                    newUser.tmpFavorite.fStatus = true;
                    newUser.tmpFavorite.fName = existObject.name;
                    newUser.tmpFavorite.fTime = new Date();
                    newUser.favorite.push(newUser.tmpFavorite);
                    newUser.save().then(u => res.status(200).json(onlyReturnFavorite(u)));
                }
            }
        });
    }, () => res.status(500).end());
};

module.exports = {
    findOneByUserId,addHistory,addFavorite
}