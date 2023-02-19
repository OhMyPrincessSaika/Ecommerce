const {StatusCodes} = require('http-status-codes');
const NotFound = (req,res) => {
   return res.status(StatusCodes.NOT_FOUND).send("The route you are requesting doesn't exist");
}
module.exports = NotFound;