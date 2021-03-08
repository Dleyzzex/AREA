const passport = require("passport");
const MicrosoftStrategy = require("passport-microsoft").Strategy;

const init = require("./init");

passport.use(
    new MicrosoftStrategy(
        {
            clientID: process.env.REACT_APP_MICROSOFT_CLIENT_ID,
            clientSecret: process.env.REACT_APP_MICROSOFT_SECRET,
            callbackURL: "http://" + process.env.REACT_APP_BASE_URL + ":8080/auth/microsoft/callback"
        },
        function(accessToken, refreshToken, profile, done) {
            var userData = {
                profile: profile,
                token: accessToken
            };
            done(null, userData);
        }
    )
);

init();

module.exports = passport;