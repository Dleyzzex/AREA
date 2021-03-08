const mongoose = require('mongoose');

const tokenSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    token: String,
    expires: Date,
    created: { type: Date, default: Date.now },
    createdByIp: String,
    revoked: Date,
    revokedByIp: String,
    replacedByToken: String
});

tokenSchema.virtual('isExpired').get(function () {
    return !(Date.now() >= this.expires);
});

tokenSchema.virtual('isActive').get(function () {
    // console.log("########")
    // console.log(!this.revoked);
    // console.log("########")

    // console.log("1 = ")
    // console.log(!this.revoked)
    // console.log("2 = ")
    // console.log(!(Date.now() >= this.expires))
    return !this.revoked && !(Date.now() >= this.expires);
});

tokenSchema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: function (doc, ret) {
        // remove these props when object is serialized
        delete ret._id;
        delete ret.id;
        delete ret.user;
    }
});

module.exports = mongoose.model('RefreshToken', tokenSchema);