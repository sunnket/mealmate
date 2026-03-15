const jwt = require('jsonwebtoken');

function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }
  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

function protectStudent(req, res, next) {
  verifyToken(req, res, () => {
    if (req.user.role !== 'student') {
      return res.status(403).json({ error: 'Student access only' });
    }
    next();
  });
}

function protectAdmin(req, res, next) {
  verifyToken(req, res, () => {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access only' });
    }
    next();
  });
}

function protectGate(req, res, next) {
  verifyToken(req, res, () => {
    if (req.user.role !== 'gate') {
      return res.status(403).json({ error: 'Gate staff access only' });
    }
    next();
  });
}

module.exports = { verifyToken, protectStudent, protectAdmin, protectGate };
