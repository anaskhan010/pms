const colors = require('colors');

// Custom logger middleware
const logger = (req, res, next) => {
  const timestamp = new Date().toISOString();
  const method = req.method;
  const url = req.originalUrl;
  const ip = req.ip || req.connection.remoteAddress;
  const userAgent = req.get('User-Agent') || 'Unknown';
  
  // Color code by method
  let coloredMethod;
  switch (method) {
    case 'GET':
      coloredMethod = method.green;
      break;
    case 'POST':
      coloredMethod = method.yellow;
      break;
    case 'PUT':
      coloredMethod = method.blue;
      break;
    case 'DELETE':
      coloredMethod = method.red;
      break;
    default:
      coloredMethod = method.white;
  }

  console.log(
    `${timestamp.gray} ${coloredMethod} ${url.cyan} - ${ip.magenta} - ${userAgent.gray}`
  );

  // Log response time
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const statusCode = res.statusCode;
    
    let coloredStatus;
    if (statusCode >= 200 && statusCode < 300) {
      coloredStatus = statusCode.toString().green;
    } else if (statusCode >= 300 && statusCode < 400) {
      coloredStatus = statusCode.toString().yellow;
    } else if (statusCode >= 400 && statusCode < 500) {
      coloredStatus = statusCode.toString().red;
    } else {
      coloredStatus = statusCode.toString().red.bold;
    }
    
    console.log(
      `${timestamp.gray} ${coloredMethod} ${url.cyan} - ${coloredStatus} - ${duration}ms`.dim
    );
  });

  next();
};

module.exports = logger;
