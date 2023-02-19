const BadRequestErr = require('./BadRequestError');
const UnauthorizedErr = require('./UnauthenticatedError');
const NotFoundErr = require('./NotFoundError');
const ConflictErr = require('./DuplicateError')

module.exports = {BadRequestErr,UnauthorizedErr,NotFoundErr,ConflictErr}