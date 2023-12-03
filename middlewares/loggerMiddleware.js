const loggerMiddleware = (req, res, next) => {
  const { method, url } = req;
  const timestamp = new Date().toISOString();

  console.log(`[${timestamp}] ${method} ${url}`);

  // Pass control to the next middleware in the chain
  next();
};

module.exports = loggerMiddleware;
