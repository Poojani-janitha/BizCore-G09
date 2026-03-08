const cors = require('cors');
const express = require('express');

// ─── CORS ─────────────────────────────────────────────────────────────────────
const corsOptions = {
    origin: process.env.CLIENT_URL || 'http://localhost:5173', // Vite default port
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
