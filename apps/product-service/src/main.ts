/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import express from 'express';
import cors from 'cors';
import { errorMiddleware } from '../../../packages/error-handler/error-middleware.js';
import cookieParser from 'cookie-parser';
import swaggerUi from 'swagger-ui-express';
import router from './routes/product.router.js';
import swaggerDocument from './swagger-output.json';
import { connectDB } from '../../../packages/libs/db/connection.js';
// import { connectDB } from '../../../packages/libs/db/connection.js';

const app = express();

app.use(
  cors({
    origin: 'http://localhost:3000',
    allowedHeaders: ['Authorization', 'Content-Type'],
    credentials: true,
  }),
);

app.use(express.json());
app.use(cookieParser());

app.get('/', (req, res) => {
  res.send({ message: 'Welcome to Product API!' });
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.get('/docs-json', (req, res) => {
  res.json(swaggerDocument);
});

// Routes

app.use('/api', router);

app.use(errorMiddleware);

const port = process.env.PORT || 6002;

connectDB().then(() => {
  const server = app.listen(port, () => {
    console.log(`Product Service Listening at http://localhost:${port}/api`);
    console.log(`Swagger docs available at http://localhost:${port}/api-docs`);
  });
  server.on('error', console.error);
});
