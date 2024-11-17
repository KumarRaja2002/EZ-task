import { serve } from '@hono/node-server';
import { Context, Hono } from 'hono';

import configData from '../config/appConfig';
import { userRoutes } from './routes/user';

import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import fileRoutes from './routes/file';

const app = new Hono();

app.use("*", cors());
app.use(logger());

app.get('/', (c) => {
  return c.text('Hello Hono!');
});


app.route('/' + configData.app.api_version + '/users', userRoutes);
app.route('/' + configData.app.api_version + '/files', fileRoutes);


const port = configData.app.port;
console.log(`Server is running on port ${port}`);

app.onError((err: any, c: Context) => {
  c.status(err.status || 500)
  return c.json({
    success: false,
    status: err.status || 500,
    message: err.message || 'Something went wrong',
    errors: err.errData || null
  });
});

serve({
  fetch: app.fetch,
  port
});










