const mongoose = require('mongoose');

const adapterSchema = mongoose.Schema({
    links: [{
        input: {
            type: Number
        },
        output: {
            type: Number
        }
    }]
})

adapterSchema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: function (doc, ret) {
        // remove these props when object is serialized
        delete ret._id;
    }
});

module.exports = mongoose.model('Adapter', adapterSchema);