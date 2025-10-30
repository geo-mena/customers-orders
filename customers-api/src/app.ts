import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import { config } from './config/env.js';
import { errorHandler } from './middleware/errorHandler.js';
import customerRoutes from './routes/customerRoutes.js';
import internalRoutes from './routes/internalRoutes.js';

const app = express();

app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (config.nodeEnv === 'development') {
    app.use(morgan('dev'));
}

app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'customers-api' });
});

app.use('/customers', customerRoutes);
app.use('/internal', internalRoutes);

app.use(errorHandler);

export default app;
