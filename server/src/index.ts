import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { login } from "./routes/login";
import { cors } from 'hono/cors'
import { account } from "./routes/account";
const dotenv = require('dotenv');
const dotenvExpand = require('dotenv-expand');

const myEnv = dotenv.config({ processEnv: {} });
dotenvExpand.expand(myEnv);

const app = new Hono()

//app.use(cors())

app.use('/login', cors({
    origin: ['http://localhost:63342', 'http://localhost:8080'],
    allowHeaders: ['Content-Type', 'Accept'],
    credentials: true,
    exposeHeaders: ['Set-Cookie']
}));
app.route('/login', login);

app.use('account', cors({
    origin: ['http://localhost:63342', 'http://localhost:8080'],
    allowHeaders: ['Content-Type', 'Accept', 'Authorization'],
    credentials: true,
    exposeHeaders: ['Set-Cookie'],
    allowMethods: ['GET'],
}));
app.route('/account', account);

//app.use('/login', cors());


serve({
    fetch: app.fetch,
    port: parseInt(process.env.PORT)
})