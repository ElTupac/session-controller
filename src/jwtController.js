const jwt = require('jsonwebtoken');
const timeout = 1800000;
const secretKey = 'notTodaySession';

module.exports = {
    tokenGeneration(){
        const payload = { check: true };
        return jwt.sign(payload, secretKey, {
            expiresIn: timeout
        });
    },
    checkToken(token){
        if(token){
            let decoded;
            try {
                decoded = jwt.verify(token, secretKey);
            } catch (error) {
                return false;
            }

            if(decoded) return true;
            else return false;
        }
        else return false;
    }
}