import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { loginRoute } from "./routes/LoginRoute";
import { cors } from 'hono/cors'
import { accountRoute } from "./routes/AccountRoute";
import {moduleRoute} from "./routes/ModuleRoute";
import {attendanceRoute} from "./routes/AttendanceRoute";
import {analyticsRoute} from "./routes/AnalyticsRoute";
import {Utils} from "./utilities/Utils";
const dotenv = require('dotenv');
const dotenvExpand = require('dotenv-expand');

const myEnv = dotenv.config({ processEnv: {} });
dotenvExpand.expand(myEnv);

const app = new Hono()

app.use('/login', cors({
    origin: ['http://localhost:63342', 'http://localhost:8080'],
    allowHeaders: ['Content-Type', 'Accept'],
    credentials: true,
    exposeHeaders: ['Set-Cookie']
}));
app.route('/login', loginRoute);

app.use('/account/*', cors({
    origin: ['http://localhost:63342', 'http://localhost:8080'],
    allowHeaders: ['Content-Type', 'Accept', 'Authorization'],
    credentials: true,
    exposeHeaders: ['Set-Cookie'],
    allowMethods: ['GET', 'POST'],
}));
app.route('/account', accountRoute);

app.use('/module/*', cors({
    origin: ['http://localhost:63342', 'http://localhost:8080'],
    allowHeaders: ['Content-Type', 'Accept', 'Authorization'],
    credentials: true,
    exposeHeaders: ['Set-Cookie'],
    allowMethods: ['GET', 'POST', 'DELETE'],
}));
app.route('/module', moduleRoute);

app.use('/attendance/*', cors({
    origin: ['http://localhost:63342', 'http://localhost:8080'],
    allowHeaders: ['Content-Type', 'Accept', 'Authorization'],
    credentials: true,
    exposeHeaders: ['Set-Cookie'],
    allowMethods: ['GET', 'POST'],
}));
app.route('/attendance', attendanceRoute);

app.use('/analytics/*', cors({
    origin: ['http://localhost:63342', 'http://localhost:8080'],
    allowHeaders: ['Content-Type', 'Accept', 'Authorization'],
    credentials: true,
    exposeHeaders: ['Set-Cookie'],
    allowMethods: ['GET'],
}));
app.route('/analytics', analyticsRoute);

serve({
    fetch: app.fetch,
    port: parseInt(process.env.PORT)
})