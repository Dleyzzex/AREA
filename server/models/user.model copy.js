const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    role: {
        type: String,
        required: true
    },
    local: {
        username: { type: String},
        email: { type: String},
        password: { type: String },
        provider: { type: String, required: true }
    },
    google: {
        id: String,
        username: String,
        access_token: String,
        refresh_token: String,
    },
    github: {
        id: String,
        token: String,
        username: String,
    },
    microsoft: {
        id: String,
        username: String,
        access_token: String,
        refresh_token: String,
    },
    reddit: {
        id: String,
        username: String,
        access_token: String,
        refresh_token: String
    },
    twitch: {
        id: String,
        username: String,
        access_token: String,
        refresh_token: String
    }
});

userSchema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: function (doc, ret) {
        // remove these props when object is serialized
        delete ret._id;
        delete ret.password;
        delete ret.google;
    }
});

module.exports = mongoose.model('User', userSchema);