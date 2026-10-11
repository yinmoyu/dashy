/**
 * Express middleware function which stope static from serving YAML paths
 */
const path = require('path');

module.exports = (req, res, next) => {
  let file;
  try { file = path.normalize(decodeURIComponent(req.path)); } catch (e) { return next(); }
  if (!/\.(ya?ml|yam)(:|$)/i.test(file)) return next();
  return res.status(404).json({ success: false, message: 'Not Found' });
};
