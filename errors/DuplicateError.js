const {StatusCodes} = require('http-status-codes');
const CustomApiError = require('./CustomApiError');

class DuplicateError extends CustomApiError {
    constructor(message) {
        super(message);
        this.statusCode = StatusCodes.CONFLICT;
    }
}

module.exports = DuplicateError;