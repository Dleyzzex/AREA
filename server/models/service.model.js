const mongoose = require('mongoose');

const actionSchema = require('../models/action.model');
const reactionSchema = require('../models/reaction.model');


const serviceSchema = mongoose.Schema({
    name: {
        type: String,
        unique: true
    },
    description: {
        type: String
    },
    actions: [{
        type: actionSchema.schema
    }],
    reactions: [{
        type: reactionSchema.schema
    }]
});

serviceSchema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: function (doc, ret) {
        // remove these props when object is serialized
        delete ret._id;
    }
});

module.exports = mongoose.model('Service', serviceSchema);