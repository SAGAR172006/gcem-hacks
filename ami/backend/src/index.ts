import express from 'express';
import cors from 'cors';
import fileUpload from 'express-fileupload';
import { config } from './config';
import { errorHandler } from './middleware/errorHandler';

import { authRouter } from './routers/auth';
import { modulesRouter } from './routers/modules';
import { chatRouter } from './routers/chat';
import { statsRouter } from './routers/stats';
import { demoRouter } from './routers/demo';

const app = express();

app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(fileUpload());

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

app.use('/api/auth', authRouter);
app.use('/api/modules', modulesRouter);
app.use('/api/chat', chatRouter);
app.use('/api/stats', statsRouter);
app.use('/api/demo', demoRouter);

app.use(errorHandler);

app.listen(config.port, () => {
  console.log('Server running on port ' + config.port);
});
