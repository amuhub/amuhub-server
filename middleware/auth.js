const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const User = require('../models/User');

dotenv.config();

const auth = async (req, res, next) => {
  const token = req.header('x-auth-token');
  // if no token ( unauthorised )
  if (!token) {
    return res.status(401).json({ msg: 'No token. Authorization denied' });
  }
  // if token : add decoded user to req.user
  try {
    const secretKey = process.env.SECRET_KEY;
    const decoded = jwt.verify(token, secretKey);

    // check if user exists
    const user = await User.findById(decoded.user.id);
    if (!user) {
      return res.status(401).json({ msg: 'User does not exist' });
    }
    req.user = decoded.user;
    next();
  } catch (err) {
    console.error(err.message);
    res.status(401).json({ msg: 'Token is not valid' });
  }
};

const authOptional = async (req, res, next) => {
  const token = req.header('x-auth-token');
  // if no token ( unauthorised )
  if (token) {
    try {
      const secretKey = process.env.SECRET_KEY;
      const decoded = jwt.verify(token, secretKey);

      // check if user exists
      const user = await User.findById(decoded.user.id);
      if (!user) {
        return res.status(401).json({ msg: 'User does not exist' });
      }
      req.user = decoded.user;
      next();
    } catch (err) {
      console.error(err.message);
      res.status(401).json({ msg: 'Token is not valid' });
    }
  }
  // if token : add decoded user to req.user
  else {
    next();
  }
};

const authAdmin = (req, res, next) => {
  auth(req, res, () => {
    if (req.user.isAdmin) {
      next();
    } else {
      return res.status(403).json({ msg: 'Access denied. Admins Only' });
    }
  });
};

module.exports = { auth, authAdmin, authOptional };
