
class ErrorHandler extends Error {
    constructor(status, message) {
        super();
        Error.captureStackTrace(this, this.constructor);
        this.status = status || 500;
        this.message = message || 'Something went wrong. Please try again.';
    }
}

module.exports = {
    ErrorHandler
};
