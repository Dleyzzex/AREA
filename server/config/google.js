const passport = require("passport");
// const GoogleStrategy = require("passport-google-oauth").OAuth2Strategy;
const GoogleStrategy = require("passport-google-authcode").Strategy
const db = require("../helpers/db");
const init = require("./init");
// const User = require("../models/user.model")
const role = require("../helpers/role");

const jwt = require('express-jwt');
const { secret } = require('../config.json');
const authorize = require('../middleware/authorize');

passport.use(new GoogleStrategy(
        {
            clientID: process.env.REACT_APP_GOOGLE_CLIENT_ID,
            clientSecret: process.env.REACT_APP_GOOGLE_SECRET,
        },
        function(req, token, refreshToken, profile, done) {
            process.nextTick(function() {
                if (!req.user) {
                    db.User.findOne({ 'google.id' : profile.id }, function(err, user) {
                        if (err)
                            return done(err);
                        if (user) {
                            if (!user.google.token) {
                                user.google.token = token;
                                user.google.name = profile.displayName;
                                user.google.email = (profile.emails[0].value || '').toLowerCase();

                                user.save(function(err) {
                                    if (err)
                                        return done(err);
                                    return done(null, user);
                                });
                            }
                            return done(null, user);
                        } else {
                            var new_user = new db.User();

                            new_user.google.id = profile.id;
                            new_user.google.token = token;
                            new_user.google.name = profile.displayName;
                            new_user.google.email = (profile.emails[0].value || '').toLowerCase();
                            new_user.role = role.User;
                            new_user.save(function(err) {
                                if (err)
                                    return done(err);
                                return done(null, new_user);
                            });
                        }
                    });
                } else {
                    var user = req.user;

                    user.google.id = profile.id;
                    user.google.token = token;
                    user.google.name = profile.displayName;
                    user.google.email = (profile.emails[0].value || '').toLowerCase();

                    user.save(function(err) {
                        if (err)
                            return done(err);
                        return done(null, user);
                    });
                }
            });
        }
));

init();

module.exports = passport;