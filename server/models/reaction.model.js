const mongoose = require('mongoose');

const reactionSchema = mongoose.Schema({
    name: {
        type: String
    },
    description: {
        type: String
    },
    handler: {
        type: String
    },
    parameters: [{
        name: {
            type: String
        },
        description: {
            type: String
        },
        type: {
            type: String
        },
        required: {
            type: Boolean
        }
    }],
}) 

reactionSchema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: function (doc, ret) {
        // remove these props when object is serialized
        delete ret._id;
    }
});

module.exports = mongoose.model('Reaction', reactionSchema);