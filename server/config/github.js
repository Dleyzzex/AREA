const passport = require("passport");
const GithubStrategy = require("passport-github").Strategy;

const init = require("./init");

passport.use(
    new GithubStrategy(
        {
            clientID: process.env.REACT_APP_GITHUB_CLIENT_ID,
            clientSecret: process.env.REACT_APP_GITHUB_SECRET,
            callbackURL: "http://" + process.env.REACT_APP_BASE_URL + ":8080/auth/github/callback"
        },
        function(accessToken, refreshToken, profile, done) {
            done(null, {token: accessToken, username: profile._json.login});
        }
    )
);

init();

module.exports = passport;