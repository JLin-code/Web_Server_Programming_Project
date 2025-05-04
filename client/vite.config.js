import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
import vueDevTools from 'vite-plugin-vue-devtools';
// https://vite.dev/config/
export default defineConfig({
    plugins: [
        vue(),
        vueJsx(),
        vueDevTools(),
    ],
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url))
        },
    },
    server: {
        proxy: {
            '/api': {
                target: 'http://localhost:3000',
                changeOrigin: true,
                secure: false,
                rewrite: (path) => path,
                configure: (proxy, options) => {
                    proxy.on('error', (err, req, res) => {
                        console.log(`Proxy error: ${err}`);
                        // Return a friendly error rather than crashing
                        if (!res.headersSent) {
                            res.writeHead(500, {
                                'Content-Type': 'application/json',
                            });
                        }
                        const json = { 
                            success: false, 
                            message: 'Proxy error: Unable to connect to API server',
                            error: err.message
                        };
                        res.end(JSON.stringify(json));
                    });
                    // Add debugging
                    proxy.on('proxyReq', (proxyReq, req) => {
                        console.log(`Proxying: ${req.method} ${req.url} → ${options.target}${req.url}`);
                    });
                }
            },
            // Special handling for demo-users with fallback response when server is down
            '/api/v1/auth/demo-users': {
                target: 'http://localhost:3000',
                changeOrigin: true,
                secure: false,
                timeout: 2000, // Reduced timeout for faster fallback
                proxyTimeout: 2000, // Reduced timeout for faster fallback
                configure: (proxy, options) => {
                    // More detailed error logging for debugging
                    proxy.on('error', (err, req, res) => {
                        console.log(`Demo-users proxy error [${err.code}]: ${err.message}`);
                        console.log('Connection to API server failed - serving fallback demo users data');
                        
                        try {
                            if (!res.headersSent) {
                                res.writeHead(200, {
                                    'Content-Type': 'application/json',
                                    'X-Served-By': 'vite-proxy-fallback'
                                });
                            }
                            
                            // Ensure we're using the correct demo users structure
                            const fallbackUsers = {
                                success: true,
                                message: 'Fallback demo users (API server unavailable)',
                                users: [
                                    { 
                                        username: 'admin@example.com', 
                                        displayName: 'Admin User (Administrator)',
                                        firstName: 'Admin',
                                        lastName: 'User',
                                        isAdmin: true
                                    },
                                    { 
                                        username: 'user@example.com', 
                                        displayName: 'Regular User',
                                        firstName: 'Regular',
                                        lastName: 'User',
                                        isAdmin: false 
                                    },
                                    { 
                                        username: 'demo@example.com', 
                                        displayName: 'Demo User',
                                        firstName: 'Demo',
                                        lastName: 'User',
                                        isAdmin: false
                                    }
                                ],
                                source: 'vite-proxy-fallback'
                            };
                            
                            const responseData = JSON.stringify(fallbackUsers);
                            console.log(`Sending fallback response: ${responseData.substring(0, 100)}...`);
                            res.end(responseData);
                        } catch (responseError) {
                            console.error('Failed to send fallback response:', responseError);
                            if (!res.headersSent) {
                                res.writeHead(500, {'Content-Type': 'application/json'});
                                res.end(JSON.stringify({
                                    success: false,
                                    message: 'Failed to process request',
                                    error: responseError.message
                                }));
                            }
                        }
                    });
                    
                    // Monitor request progress
                    proxy.on('proxyReq', (proxyReq, req) => {
                        console.log(`Demo users request started: ${req.method} ${req.url} → ${options.target}${req.url}`);
                        // Set a timeout to detect stalled requests
                        req.connectionTimer = setTimeout(() => {
                            console.log(`Request to ${req.url} is taking too long, may timeout soon`);
                        }, 1500);
                    });
                    
                    // Clean up and log successful responses
                    proxy.on('proxyRes', (proxyRes, req) => {
                        // Clear timeout for successful responses
                        if (req.connectionTimer) {
                            clearTimeout(req.connectionTimer);
                        }
                        console.log(`Demo users response: ${proxyRes.statusCode} from ${options.target}${req.url}`);
                    });
                }
            },
            '/api/v1/health': {
                target: 'http://localhost:3000',
                changeOrigin: true,
                secure: false,
                timeout: 1500, // Short timeout for health checks
                configure: (proxy) => {
                    proxy.on('error', (err, req, res) => {
                        console.log(`Health check proxy error [${err.code}]: ${err.message}`);
                        
                        // Send a fallback health response when the API is down
                        if (!res.headersSent) {
                            res.writeHead(200, {
                                'Content-Type': 'application/json',
                                'X-Served-By': 'vite-proxy-fallback'
                            });
                            
                            const fallbackHealth = {
                                success: true,
                                timestamp: new Date().toISOString(),
                                message: 'Fallback health response (API server unavailable)',
                                status: 'fallback',
                                server_status: 'unreachable'
                            };
                            
                            res.end(JSON.stringify(fallbackHealth));
                        }
                    });
                    
                    proxy.on('proxyReq', (proxyReq, req) => {
                        console.log(`Health check request started: ${req.method} ${req.url}`);
                    });
                }
            },
            '/api/v1/auth/current-user': {
                target: 'http://localhost:3000',
                changeOrigin: true,
                secure: false,
                timeout: 2000,
                configure: (proxy, options) => {
                    proxy.on('error', (err, req, res) => {
                        console.log(`Current user proxy error [${err.code}]: ${err.message}`);
                        console.log('Connection to API server failed - serving fallback current-user data');
                        
                        try {
                            if (!res.headersSent) {
                                res.writeHead(200, {
                                    'Content-Type': 'application/json',
                                    'X-Served-By': 'vite-proxy-fallback'
                                });
                            }
                            
                            const fallbackCurrentUser = {
                                success: false,
                                message: 'API server unavailable',
                                user: null,
                                isAuthenticated: false,
                                source: 'vite-proxy-fallback'
                            };
                            
                            const responseData = JSON.stringify(fallbackCurrentUser);
                            console.log(`Sending fallback current-user response: ${responseData}`);
                            res.end(responseData);
                        } catch (responseError) {
                            console.error('Failed to send fallback response:', responseError);
                            if (!res.headersSent) {
                                res.writeHead(500, {'Content-Type': 'application/json'});
                                res.end(JSON.stringify({
                                    success: false,
                                    message: 'Failed to process request',
                                    error: responseError.message
                                }));
                            }
                        }
                    });
                    
                    proxy.on('proxyReq', (proxyReq, req) => {
                        console.log(`Current user request started: ${req.method} ${req.url} → ${options.target}${req.url}`);
                    });
                }
            },
            // Add a general fallback for all other API requests
            '^/api/v1/': {
                target: 'http://localhost:3000',
                changeOrigin: true,
                secure: false,
                configure: (proxy, options) => {
                    proxy.on('error', (err, req, res) => {
                        console.log(`API proxy error [${err.code}]: ${err.message} for ${req.url}`);
                        
                        if (!res.headersSent) {
                            res.writeHead(503, {
                                'Content-Type': 'application/json',
                                'X-Served-By': 'vite-proxy-fallback'
                            });
                            
                            const fallbackResponse = {
                                success: false,
                                message: 'API server unavailable',
                                endpoint: req.url,
                                source: 'vite-proxy-fallback'
                            };
                            
                            res.end(JSON.stringify(fallbackResponse));
                        }
                    });
                    
                    proxy.on('proxyReq', (proxyReq, req) => {
                        console.log(`API request: ${req.method} ${req.url} → ${options.target}${req.url}`);
                    });
                }
            },
            '/api/v1/health/ping': {
                target: 'http://localhost:3000',
                changeOrigin: true,
                secure: false,
                timeout: 1000, // Very short timeout for ping
                configure: (proxy) => {
                    proxy.on('error', (err, req, res) => {
                        // Send a minimal fallback ping response
                        if (!res.headersSent) {
                            res.writeHead(200, {
                                'Content-Type': 'application/json',
                                'X-Served-By': 'vite-proxy-fallback'
                            });
                            
                            res.end(JSON.stringify({
                                status: 'fallback',
                                time: Date.now()
                            }));
                        }
                    });
                }
            }
        },
        // Add more options for better development experience
        host: true, // Listen on all local IPs
        strictPort: false, // Try another port if default is in use
        hmr: {
            overlay: true // Show errors as overlay
        }
    }
});
