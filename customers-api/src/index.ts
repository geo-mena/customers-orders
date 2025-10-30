import app from './app.js';
import { config } from './config/env.js';
import { testConnection } from './config/database.js';

async function start() {
    try {
        await testConnection();

        app.listen(config.port, () => {
            console.log(`Customers API running on port ${config.port}`);
            console.log(`Environment: ${config.nodeEnv}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

start();
