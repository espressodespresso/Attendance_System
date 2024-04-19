import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { loginRoute } from "./routes/LoginRoute";
import { cors } from 'hono/cors'
import { accountRoute } from "./routes/AccountRoute";
import {moduleRoute} from "./routes/ModuleRoute";
import {attendanceRoute} from "./routes/AttendanceRoute";
import {analyticsRoute} from "./routes/AnalyticsRoute";
import { readFileSync } from 'node:fs'
import {createSecureServer} from "node:http2";
const dotenv = require('dotenv');
const dotenvExpand = require('dotenv-expand');

const myEnv = dotenv.config({ processEnv: {} });
dotenvExpand.expand(myEnv);

const app = new Hono();


app.use('/login', cors({
    origin: ['https://localhost:63342', 'https://localhost:443'],
    allowHeaders: ['Content-Type', 'Accept'],
    credentials: true,
    exposeHeaders: ['Set-Cookie']
}));
app.route('/login', loginRoute);

app.use('/account/*', cors({
    origin: ['https://localhost:63342', 'https://localhost:443'],
    allowHeaders: ['Content-Type', 'Accept', 'Authorization'],
    credentials: true,
    exposeHeaders: ['Set-Cookie'],
    allowMethods: ['GET', 'POST', 'DELETE'],
}));
app.route('/account', accountRoute);

app.use('/module/*', cors({
    origin: ['https://localhost:63342', 'https://localhost:443'],
    allowHeaders: ['Content-Type', 'Accept', 'Authorization'],
    credentials: true,
    exposeHeaders: ['Set-Cookie'],
    allowMethods: ['GET', 'POST', 'DELETE'],
}));
app.route('/module', moduleRoute);

app.use('/attendance/*', cors({
    origin: ['https://localhost:63342', 'https://localhost:443'],
    allowHeaders: ['Content-Type', 'Accept', 'Authorization'],
    credentials: true,
    exposeHeaders: ['Set-Cookie'],
    allowMethods: ['GET', 'POST'],
}));
app.route('/attendance', attendanceRoute);

app.use('/analytics/*', cors({
    origin: ['https://localhost:63342', 'https://localhost:443'],
    allowHeaders: ['Content-Type', 'Accept', 'Authorization'],
    credentials: true,
    exposeHeaders: ['Set-Cookie'],
    allowMethods: ['GET'],
}));
app.route('/analytics', analyticsRoute);

const server = serve({
    fetch: app.fetch,
    port: parseInt(process.env.PORT),
    createServer: createSecureServer,
    serverOptions: {
        key: readFileSync('ssl/private.pem'),
        cert: readFileSync('ssl/certificate.pem')
    }
})



/*serve({
    fetch: app.fetch,
    port: parseInt(process.env.PORT),
    serverOptions: {
        allowHTTP1: false,
        key: fs.readFileSync('ssl/private.key'),
        cert: fs.readFileSync('ssl/certificate.csr')
    }
})*/