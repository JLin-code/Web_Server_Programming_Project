const express = require('express');
const router = express.Router();
const os = require('os');

// Simple health check endpoint with CORS handling
router.get('/', (req, res) => {
  // Add CORS headers for health check endpoint to make it accessible from any origin
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Add more detailed health information that could help diagnose issues
  return res.status(200).json({
    success: true,
    timestamp: new Date().toISOString(),
    message: 'API server is running',
    uptime: process.uptime(),
    hostname: os.hostname(),
    // Add network info to help diagnose connection issues
    network: {
      interfaces: Object.entries(os.networkInterfaces())
        .reduce((acc, [name, interfaces]) => {
          acc[name] = interfaces.map(iface => ({
            address: iface.address,
            family: iface.family,
            internal: iface.internal
          }));
          return acc;
        }, {}),
      listening_port: process.env.PORT || 3000
    }
  });
});

// Extended health check with more system information
router.get('/extended', (req, res) => {
  // Add CORS headers for extended health checks too
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  return res.status(200).json({
    success: true,
    timestamp: new Date().toISOString(),
    system: {
      platform: os.platform(),
      arch: os.arch(),
      cpus: os.cpus().length,
      memory: {
        total: os.totalmem(),
        free: os.freemem(),
        usage: ((os.totalmem() - os.freemem()) / os.totalmem() * 100).toFixed(2) + '%'
      },
      uptime: {
        system: os.uptime(),
        process: process.uptime()
      }
    },
    nodejs: {
      version: process.version,
      env: process.env.NODE_ENV || 'development'
    }
  });
});

// Add a quick endpoint for minimal latency health checks
router.get('/ping', (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Return minimal response for low-latency checks
  return res.status(200).json({
    status: 'up',
    time: Date.now()
  });
});

// Add endpoint to help diagnose connection issues
router.get('/connection-test', (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  
  // Get client IP information to help diagnose connection issues
  const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  const clientPort = req.socket.remotePort;
  
  return res.status(200).json({
    success: true,
    message: 'Connection test successful',
    timestamp: new Date().toISOString(),
    client: {
      ip: clientIp,
      port: clientPort,
      headers: {
        host: req.headers.host,
        origin: req.headers.origin,
        referer: req.headers.referer,
        'user-agent': req.headers['user-agent']
      }
    },
    server: {
      hostname: os.hostname(),
      platform: os.platform(),
      port: process.env.PORT || 3000,
      nodeVersion: process.version
    }
  });
});

// Add a special debug/reset endpoint for server recovery
router.post('/reset', async (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow in development mode
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({
      success: false,
      message: 'Reset endpoint is not available in production'
    });
  }

  try {
    // Try to perform some recovery operations
    // 1. Garbage collection if available
    if (global.gc) {
      global.gc();
    }
    
    // 2. Clear any module caches that might be problematic
    Object.keys(require.cache).forEach(key => {
      if (key.includes('node_modules')) return; // Skip node modules
      
      // Skip core modules and this file
      if (key.includes('health.js') || 
          key.includes('system.js') || 
          key.includes('index.js')) return;
          
      delete require.cache[key];
    });
    
    // 3. Log memory usage before and after
    const memBefore = process.memoryUsage();
    
    // Wait a moment for GC to complete if triggered
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const memAfter = process.memoryUsage();

    return res.status(200).json({
      success: true,
      message: 'Server recovery attempted',
      details: {
        memoryBefore: {
          rss: formatBytes(memBefore.rss),
          heapTotal: formatBytes(memBefore.heapTotal),
          heapUsed: formatBytes(memBefore.heapUsed)
        },
        memoryAfter: {
          rss: formatBytes(memAfter.rss),
          heapTotal: formatBytes(memAfter.heapTotal),
          heapUsed: formatBytes(memAfter.heapUsed)
        },
        reduction: {
          rss: formatBytes(memBefore.rss - memAfter.rss),
          heapTotal: formatBytes(memBefore.heapTotal - memAfter.heapTotal),
          heapUsed: formatBytes(memBefore.heapUsed - memAfter.heapUsed)
        }
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error during server reset:', error);
    return res.status(500).json({
      success: false,
      message: 'Error during server reset',
      error: error.message
    });
  }
});

// Helper function to format bytes
function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  
  const i = Math.floor(Math.log(Math.abs(bytes)) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

module.exports = router;
