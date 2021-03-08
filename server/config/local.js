const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require('bcryptjs');

const init = require("./init");
const User = require("../models/user.model")



passport.use('local-login', new LocalStrategy(
    {
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true
    },
    function(req, email, password, done) {
        if (email)
            email = email.toLowerCase();
        process.nextTick(function() {
            User.findOne({ 'local.email': email}, function(err, user) {
                if (err)
                    return done(err);
                if (!user)
                    return done(null, false);
                if (!bcrypt.compareSync(password, user.password))
                    return done(null, false);
                else
                    return done(null, user);
            });
        });
    }
));

passport.use('local-signup', new LocalStrategy(
    {
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true
    },
    function(req, email, password, done) {
        if (email)
            email = email.toLowerCase();
        process.nextTick(function() {
            User.findOne({ 'local.email' : email }, function(err, user) {
                if (!req.user) {
                    User.findOne({'local.email' : email}, function(err, user) {
                        if (err)
                            return done(err);
                        if (user) {
                            return done(null, false);
                        } else {
                            var new_user = new User();
                            new_user.local.email = email;
                            new_user.local.password = bcrypt.hashSync(password, 10);
                            new_user.role = "user"

                            new_user.save(function (err) {
                                if (err)
                                    return done(err);
                                return done(null, new_user);
                            });
                        }
                    });
                } else if (!req.user.local.email) {
                    User.findOne({ 'local.email' : email }, function(err, user) {
                        if (err)
                            return done(err);
                        if (user) {
                            return done(null, false);
                        } else {
                            var user = req.user;
                            user.local.email = email;
                            user.local.passport = bcrypt.hashSync(password, 10);
                            user.local.role = "user";
                            user.save(function (err) {
                                if (err)
                                    return done(err);
                                return done(null, user);
                            });
                        }
                    });
                } else {
                    return done(null, req.user);
                }
            });
        });
    }
));

init();

module.exports = passport;