const config = require('../config.json');
const mongoose = require('mongoose');
const connectionOptions = { useCreateIndex: true, useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false };
mongoose.connect(process.env.MONGODB_URI || config.connectionString, connectionOptions);
mongoose.Promise = global.Promise;

module.exports = {
    User: require('../models/user.model'),
    RefreshToken: require('../models/refresh-token.model'),
    Service: require('../models/service.model'),
    Action: require('../models/action.model'),
    Reaction: require('../models/reaction.model'),
    Adapter: require('../models/adapter.model'),
    Script: require('../models/script.model'),
    isValidId
};

function isValidId(id) {
    return mongoose.Types.ObjectId.isValid(id);
}