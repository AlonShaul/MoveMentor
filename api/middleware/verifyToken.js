import jwt from "jsonwebtoken";

const verifyToken = (req, res, next) => {
  const token = req.headers.authorization.split(' ')[1];
  if (!token) {
    return res.status(401).json("Not authenticated!");
  }

  jwt.verify(token, "jwtkey", (err, user) => {
    if (err) {
      return res.status(403).json("Token is not valid!");
    }
    req.user = user;
    next();
  });
};

export default verifyToken;
