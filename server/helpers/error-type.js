const USER_NOT_FOUND = [401, "User not found."]
const USER_ALREADY_EXIST = [409, "User already exist."]
const UNLINK_ACCOUNT = [403, "Cant unlink a provider account."]
const LINK_ACCOUNT = [403, "Cant link a provider account."]
const INVALID_AUTH_CODE = [401, "Invalid authorization code."]
const INVALID_CREDENTIALS = [401, "Invalid email or password."]
const MISSING_REFRESH_TOKEN = [401, "Refresh token missing. Please update your authorization code scope."]
const UNAUTHORIZED = [401, 'Unauthorized.']

module.exports = {
    USER_NOT_FOUND,
    USER_ALREADY_EXIST,
    UNLINK_ACCOUNT,
    LINK_ACCOUNT,
    INVALID_AUTH_CODE,
    INVALID_CREDENTIALS,
    MISSING_REFRESH_TOKEN,
    UNAUTHORIZED
}