var config = require('../config/configure');
var {Setting, TrafficSituationSetting, CameraSituationSetting, TrafficEventSetting} = require('../models/setting');
var jwt = require('jsonwebtoken');
// var q = require('q');
// var consul = require('consul')({ host: config.consulHost });
var sessionExpireTime = 30 * 60; // 30 minutes
var secretKey = config.secretKey;
var sessionKey = null;
var frontendCamera = ['imageError', 'cameraType', 'refreshTime'];
var frontendSituation = ['mapUrl', 'refreshTime', 'configVelocity'];
var frontendTrafficevent = ['refreshTime', 'voiceType', 'sourceConfig'];
var defaultSetting = require('../config/defaultSetting').defaultSetting;

var mapUrl = {
    fpt: {
        name: 'FPT',
        mapType: 'fpt',
        values: {
            street: '//map.thongtingiaothong.vn/transport-notext/{z}/{x}/{y}.png',
            streetName: '//map.thongtingiaothong.vn/transport-text/{z}/{x}/{y}.png',
            full: '//map.thongtingiaothong.vn/transport-full/{z}/{x}/{y}.png'
        }
    },
    custom: {
        name: 'Custom',
        mapType: 'custom',
        values: {
            street: '',
            streetName: '',
            full: ''
        }
    }
};

var settingFrontend = function (st) {
    var setting = JSON.parse(JSON.stringify(st));
    if (setting.cameraSituations) {
        Object.keys(setting.cameraSituations).forEach(function (key) {
            if (frontendCamera.indexOf(key) < 0) {
                delete setting.cameraSituations[key];
            }
        }, this);
    }
    if (setting.trafficSituations) {
        Object.keys(setting.trafficSituations).forEach(function (key) {
            if (frontendSituation.indexOf(key) < 0) {
                delete setting.trafficSituations[key];
            }
        }, this);
    }
    if (setting.trafficEvents) {
        Object.keys(setting.trafficEvents).forEach(function (key) {
            if (frontendTrafficevent.indexOf(key) < 0) {
                delete setting.trafficEvents[key];
            }
        }, this);
    }
    return setting;
};

var makeKey = function () {
    var text = '';
    var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789~!@#$%^&*()_+{}|:<>?';
    for (var i = 0; i < 10; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
};

//open while running consul
// var setAnalyticPeriod = function (value) {
//     var defer = q.defer();
//     consul.kv.set(config.consulTrafficSituation + '/job_time', '' + value, function (err, result) {
//         if (err) {
//             defer.reject(err);
//         } else {
//             defer.resolve(result);
//         }
//     });
//     return defer.promise;
// };

// var setAggregatePeriod = function (value) {
//     var defer = q.defer();
//     consul.kv.set(config.consulTrafficSituation + '/query_time', '' + value, function (err, result) {
//         if (err) {
//             defer.reject(err);
//         } else {
//             defer.resolve(result);
//         }
//     });
//     return defer.promise;
// };
// open while running consul

function getSession(req, res) 
{

    if(req.user['https://hoang0650.com/roles'].indexOf('admin') < 0 || req.user['https://hoang0650.com/roles'].indexOf('superadmin') < 0){
        return res.status(500).json({ message: 'NOT_PERMISSION' });
    }
    // console.log('req.user', req.user['https://hoang0650.com/roles']);
    var keyObject = {
        userInfo: makeKey(),
        name: req.user['https://hoang0650.com/name']
    };
    var userSession = jwt.sign(keyObject,
        Buffer.from(secretKey, 'base64'),
        { expiresIn: sessionExpireTime});
    var responseObject = {
        token: userSession,
        createdAt: new Date(),
        expiredAt: new Date(new Date().getTime() + sessionExpireTime * 1000)
    };

    if (!sessionKey) {
        sessionKey = userSession;
        
        res.status(200).json(responseObject);
    } else {

         jwt.verify(sessionKey, Buffer.from(secretKey, 'base64'), function(err, decoded) {
            // if (err) {
            //     sessionKey = userSession;
            // } else {
                delete responseObject.token;
                decoded = req.user;
                responseObject.message = 'SESSION_HAD_USED';
                responseObject.name = decoded['https://hoang0650.com/name'];
            // }
            res.status(200).json(responseObject);
        });
    }
};

function create(req, res) 
{
    var userSession = req.body.sessionKey;  
    if (req.user['https://hoang0650.com/roles'].indexOf('admin') < 0) {
        return res.status(500).json({ message: 'NOT_PERMISSION' });
    }
    if (!sessionKey || !userSession || userSession !== sessionKey) {
        if (!sessionKey) {
            return res.status(500).json({ message: 'WRONG_STEP' });
        } else if (!userSession) {
            return res.status(500).json({ message: 'NO_SESSION' });
        } else if (userSession !== sessionKey) {
            return res.status(500).json({ message: 'NOT_MATCH_SESSION' });
        }
    } else 
    {
         jwt.verify(userSession, Buffer.from(secretKey, 'base64'), {algorithms:['HS256','RS256','sha1']},function(err) {
            if (!err) {
                if (req.body._id) {
                    delete req.body._id;
                }
                var setting = new Setting(req.body);
                setting.createdAt = new Date();
                setting.creator = {
                    source: 'TTGT',
                    name: req.user.name
                };
                setting.status = 'pending';
                Setting.findOne({
                    status: 'pending'
                }).exec().then(oldSetting => {

                    if (req.body.cameraSituations) {
                        if (req.body.cameraSituations._id) {
                            delete req.body.cameraSituations._id;
                        }
                        setting.cameraSituations = new CameraSituationSetting(req.body.cameraSituations);
                    } else if (oldSetting) {
                        setting.cameraSituations = oldSetting.cameraSituations;
                    }
                    if (req.body.trafficSituations) {
                        if (req.body.trafficSituations._id) {
                            delete req.body.trafficSituations._id;
                        }
                        setting.trafficSituations = new TrafficSituationSetting(req.body.trafficSituations);
                        if (req.body.trafficSituations.mapUrl && (req.body.trafficSituations.mapUrl.mapType === 'FPT')) {
                            setting.trafficSituations.mapUrl = mapUrl.fpt;
                        }
                    } else if (oldSetting) {
                        setting.trafficSituations = oldSetting.trafficSituations;
                    }
                    if (req.body.trafficEvents) {
                        if (req.body.trafficEvents._id) {
                            delete req.body.trafficEvents._id;
                        }
                        setting.trafficEvents = new TrafficEventSetting(req.body.trafficEvents);
                    } else if (oldSetting) {
                        setting.trafficEvents = oldSetting.trafficEvents;
                    }
                    if (oldSetting) {
                        oldSetting.status = 'updated';
                        oldSetting.update(oldSetting).then(() => {
                            setting.save().then(st => {

                                sessionKey = null;
                                // open 215 to 221 when running consul
                                // q.all([setAnalyticPeriod(st.trafficSituations.analyticPeriod), setAggregatePeriod(st.trafficSituations.aggregatePeriod)]).then(() => {
                                //     console.log('session key', sessionKey);
                                //     res.status(200).send(st);
                                // }, err => {
                                //     res.status(500).send(err);
                                //     console.log('error: ',err);
                                // });
                                // comment 223 when test running consul
                                    res.status(200).send(st);
                            }, err => res.status(500).send(err));
                        }, err => res.status(500).send(err));
                    } else {
                        setting.save().then(st => {
                            sessionKey = null;
                            // q.all([setAnalyticPeriod(st.trafficSituations.analyticPeriod), setAggregatePeriod(st.trafficSituations.aggregatePeriod)]).then(() => {
                            //     res.status(200).send(st);
                            // }, err => {
                            //     console.log('err message:',err);
                            //     res.status(500).send(err);
                            // });
                                  res.status(200).send(st);
                        }, err => res.status(500).send('error:',err));
                    }
                }, err => res.status(500).send(err));
            } 
            else {
                res.status(500).json({ message: 'KEYERROR' });
            }
        });
    }
};

function findAll (req, res) {
    Setting.find({}).sort('createdAt').exec()
        .then((st, err) => st && res.status(200).send(st) || res.status(500).send(err));
};

function findById (req, res) {
    
    if (!req.body.setting) {
        return res.status(404).end();
    }
    else {
        return res.status(200).json({msg:'success'},req.body.setting);
    }
        
};

function getMapUrl (req, res) {
    res.status(200).json(mapUrl);
};

function getLastSetting (req, res) {
    Setting.find({
    }).sort({ 'createdAt': -1 }).limit(1).exec()
        .then(st => {
            if (st && st.length > 0) {
                if (st[0].status === 'pending' && (((Math.floor(new Date(st[0].createdAt).getTime() / 100000) * 100000) + 24 * 60 * 60 * 1000) < new Date().getTime())) {
                    st[0].status = 'applied';
                    st[0].update(st[0]).then(() => {
                        res.status(200).json(st[0]);
                    }, err => {
                        res.status(500).send(err);
                    });
                } else {
                    res.status(200).send(st[0]);
                }
            } else {
                res.status(500).end();
            }
        }, err => res.status(500).send(err));
};

function cancelSession (req, res) {
   
    if (req.user['https://hoang0650.com/roles'].indexOf('admin') < 0) {
        return res.status(500).json({ message: 'NOT_PERMISSION' });
    }
    var userSession = req.body.sessionKey;
    if (!sessionKey || !userSession || userSession !== sessionKey) {
        return res.status(500).end();
    }
    sessionKey = null;
    return res.status(200).end();
};

function getFrontendSetting (req, res) {
    Setting.find({}).sort({ 'createdAt': -1 }).limit(1).exec()
        .then(st => {
            if (st && st.length > 0) {
                if (st[0].status === 'applied') {
                    return res.status(200).json(settingFrontend(st[0]));
                } else if (st[0].status === 'pending' && (((Math.floor(new Date(st[0].createdAt).getTime() / 100000) * 100000) + 24 * 60 * 60 * 1000) < new Date().getTime())) {
                    st[0].status = 'applied';
                    st[0].update(st[0]).then(() => {
                        return res.status(200).json(settingFrontend(st[0]));
                    }, err => {
                        return res.status(500).send(err);
                    });
                } else {
                    Setting.find({
                        status: 'applied'
                    }).sort({ 'createdAt': -1 }).limit(1).exec()
                        .then(st => {
                            return res.status(200).json(settingFrontend(st[0]));
                        }, err => {
                            return res.status(500).send(err);
                        });
                }

                settingFrontend(st[0]);
                return res.status(200).json(settingFrontend(st[0]));

            } else {
                res.status(200).json(defaultSetting);
            }
        }, err => res.status(500).send(err));
};


function getFirstFrontendSetting(req, res) {
    Setting.find({
        status: 'applied'
    }).sort({ 'createdAt': 1 }).limit(1).exec()
        .then(st => {
            if (st && st.length > 0) {
                return res.status(200).json(settingFrontend(st[0]));
            } else {
                res.status(500).end();
            }
        }, err => res.status(500).send(err));
};

function getFirstSetting (req, res) {
    Setting.find({
        status: 'applied'
    }).sort({ 'createdAt': 1 }).limit(1).exec()
        .then(st => {
            if (st && st.length > 0) {
                res.status(200).json(st[0]);
            } else {
                res.status(500).end();
            }
        }, err => res.status(500).send(err));
};

function getImageError (req, res) {
    Setting.find({
        status: 'updated'
    }).sort({ 'createdAt': -1 }).limit(1).exec().then(st => {
        if (st && st.length > 0) {
            var setting = st[0];
            console.log(setting);
            if (setting.cameraSituations && setting.cameraSituations.imageError) {
                if (setting.cameraSituations.imageError.imageType === 'text') {
                    var textContent = encodeURIComponent(setting.cameraSituations.imageError.text);
                    var url = `//dummyimage.com/600x400/000/ff0000&text=${textContent}`;
                    res.header('Cache-Control', 'no-cache, no-store, must-revalidate');
                    res.header('Pragma', 'no-cache');
                    res.header('Expires', 0);
                    return res.redirect(307, url);
                } else {
                    var data = setting.cameraSituations.imageError.image.split(',');
                    if (data.length === 2) {
                        var buffer = Buffer.from(data[1], 'base64');
                        res.writeHead(200, { 'Content-Type': 'image/png', 'Content-Length': buffer.length, 'Cache-Control': 'no-cache' });
                        res.end(buffer);
                    }
                }
            }
        } else {
            res.status(500).end();
        }
    }, err => res.status(500).send(err));
};


module.exports = {
    getSession,
    create,
    findAll,
    findById,
    getMapUrl,
    getLastSetting,
    cancelSession,
    getFrontendSetting,
    getFirstFrontendSetting,
    getFirstSetting,
    getImageError
}