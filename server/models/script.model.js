const mongoose = require('mongoose');

const actionSchema = require('./action.model');
const reactionSchema = require('./reaction.model');

const scriptSchema = mongoose.Schema({
    name: {
        type: String
    },
    action: {
        type: mongoose.Schema.Types, ref: 'Action'
    },
    reaction: {
        type: mongoose.Schema.Types, ref: 'Reaction'
    },
    action_parameters: [
        {}
    ],
    reaction_parameters: [
        {}
    ],
    trigger: {
        type: Number
    },
    user: {
        type: mongoose.Schema.Types.ObjectId, ref: 'User'
    },
    creation_date: {
        type: Date,
        default: () => new Date()
    },
    last_update: {
        type: Date,
        default: () => new Date()
    },
    status: {
        type: String
    }

});

scriptSchema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: function (doc, ret) {
        // remove these props when object is serialized
        delete ret._id;
    }
});

module.exports = mongoose.model('Script', scriptSchema);