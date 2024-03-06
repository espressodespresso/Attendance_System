import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { loginRoute } from "./routes/LoginRoute";
import { cors } from 'hono/cors'
import { accountRoute } from "./routes/AccountRoute";
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

serve({
    fetch: app.fetch,
    port: parseInt(process.env.PORT)
})