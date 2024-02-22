import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { login } from "./routes/login";
import { cors } from 'hono/cors'
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
//app.use('/login', cors());


serve({
    fetch: app.fetch,
    port: parseInt(process.env.PORT)
})