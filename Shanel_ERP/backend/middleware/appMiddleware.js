const cors = require('cors');
const express = require('express');

const envOrigins = (process.env.CLIENT_URL || '')
    .split(',')
    .map(origin => origin.trim())
    .filter(Boolean);

const allowedOrigins = new Set([
    ...envOrigins,
    'http://localhost:5173',
    'http://localhost:5174'
]);

// ─── CORS ─────────────────────────────────────────────────────────────────────
const corsOptions = {
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.has(origin)) {
            return callback(null, true);
        }
        return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
};

const corsMiddleware = cors(corsOptions); //allow frontend to access backend

// ─── BODY PARSERS ─────────────────────────────────────────────────────────────
const jsonParser    = express.json();//Convert JSON request body into a JavaScript object
const urlencodedParser = express.urlencoded({ extended: true }); //Parse URL-encoded data (from forms) into req.body

// ─── REQUEST LOGGER (dev only) ────────────────────────────────────────────────

const requestLogger = (req, res, next) => {
    //Log incoming requests in development mode for debugging
    if (process.env.NODE_ENV !== 'production') {
        console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
    }
    next();
};

// ─── REGISTER ALL MIDDLEWARE ON APP ───────────────────────────────────────────
const applyMiddleware = (app) => {
    app.use(corsMiddleware);
    app.use(jsonParser);
    app.use(urlencodedParser);
    app.use(requestLogger);
};

module.exports = applyMiddleware;
