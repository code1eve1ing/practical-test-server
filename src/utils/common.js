const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const generateOTP = () => {
    return crypto.randomInt(1000, 9999).toString();
};

const verifyJwtToken = (token, secretKey) => {
    try {
        jwt.verify(token, secretKey);
        return true;
    } catch (err) {
        console.log(err)
        return false;
    }
}

module.exports = {generateOTP, verifyJwtToken};
