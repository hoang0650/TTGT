const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// setting 
const SettingSchema = new Schema({
    createdAt: Date,
    creator: {
        source: { type: String, required: true },
        name: String
    },
    status: String, // pending, applied, executed, updated
    cameraSituations: Schema.Types.Mixed,
    trafficSituations: Schema.Types.Mixed,
    trafficEvents: Schema.Types.Mixed
})

SettingSchema.statics.load = function (req, cb) {
    this.findOne({ _id: req }).exec(cb);
};

const Setting = mongoose.model('Setting', SettingSchema);

// Camera Situation Setting

const CameraSituationSettingSchema = new Schema({
    refreshTime: Number, //minutes
    refreshCameraLayer: Number, //minutes
    imageError: {
        imageType: String, //text, image
        text: String, //text
        image: String //base64
    },
    errorTime: Number, //minutes
    cameraType: [{
        name: String,
        configWith: Array,
        connectUrl: String
    }]
});

const CameraSituationSetting = mongoose.model('CameraSituationSetting', CameraSituationSettingSchema);

// traffic situation setting

const TrafficSituationSettingSchema = new Schema({
    mapUrl: {
        name: String,
        mapType: String, //fts, vbd, custom
        values: {
            street: String, //url
            streetName: String, //url
            full: String //url
        }
    },
    refreshTime: Number, //minutes
    analyticPeriod: Number, //minutes
    aggregatePeriod: Number, //minutes
    configVelocity: {
        jam: {
            name: String,
            speed: Number
        },
        congestion: {
            name: String,
            speed: Number
        },
        slow: {
            name: String,
            speed: Number
        },
        normal: {
            name: String,
            speed: Number
        }
    }
});

const TrafficSituationSetting = mongoose.model('TrafficSituationSetting', TrafficSituationSettingSchema);

// traffic event setting

const TrafficEventSettingSchema = new Schema({
    refreshTime: Number, //minutes
    voiceType: String,
    sourceConfig: [{
        sourceType: String,
        autoAccept: Boolean,
        canCreate: Boolean
    }],
    configVelocity: {
        jam: {
            name: String
        },
        congestion: {
            name: String
        },
        incident: {
            name: String
        },
        flood: {
            name: String
        },
        normal: {
            name: String
        }
    }
});

const TrafficEventSetting = mongoose.model('TrafficEventSetting', TrafficEventSettingSchema);
module.exports = {Setting, CameraSituationSetting, TrafficSituationSetting, TrafficEventSetting};

module.exports = {
    Setting, CameraSituationSetting, TrafficSituationSetting, TrafficEventSetting
}