// roleMiddleware.js
// Usage: requireRole('admin') or requireRole('admin','teacher')
module.exports = function requireRole(...allowedRoles) {
  return (req, res, next) => {
    const user = req.user; // set by authMiddleware
    if (!user || !user.role) return res.status(401).json({ error: "Unauthorized" });
    if (allowedRoles.includes(user.role)) return next();
    return res.status(403).json({ error: "Forbidden: insufficient permissions" });
  };
};
