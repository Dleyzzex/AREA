var passport = require('passport');

module.exports = function() {
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });
    
    // used to deserialize the user
    passport.deserializeUser(function(id, done) {
        db.User.findById(id, function(err, user) {
            done(err, user);
        });
    });
    
};