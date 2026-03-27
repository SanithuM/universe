const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
    // get the token from the header
    const token = req.header('auth-token');
    if (!token) return res.status(401).send('Access Denied: No Token Provided');

    try {
        // Verify the token
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.user = verified; // Add the user ID to the request object
        next(); // Let them pass to the route!
    } catch (err) {
        res.status(400).send('Invalid Token');
    }
};