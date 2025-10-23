import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import analyzeRoutes from './routes/analyze';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api', analyzeRoutes);

app.get('/', (req: Request, res: Response) => {
  res.json({
    message: 'DevOpsFix API Server',
    version: '1.0.0',
    endpoints: {
      analyze: 'POST /api/analyze',
      providers: 'GET /api/providers',
      cicdTypes: 'GET /api/cicd-types'
    }
  });
});

// Not found & error handling middleware
app.use(notFoundHandler);
app.use(errorHandler);

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});

export default app;
