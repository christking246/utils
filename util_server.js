const express = require("express");

// environment variables configuration
require("dotenv").config();

global.VERSION = process.env.VERSION || "1.0.0";
global.LOG_DIR = __dirname + "/logs";
const morganLogger = require("./logger/morganLogger");
const logger = require("./logger/index.js").setup();

// Server routes
const mhtRouter = require("./routes/mht.js");
const hashRouter = require("./routes/hashGenerator.js");

const mcpRouter = require("./routes/mcp.js");

const app = express();

app.use(morganLogger);
app.use(express.json({ limit: '50mb' }));
app.use(["/"], express.static("static"));
app.use("/api/ping", (_, res) => res.status(200).send({ msg: "Pong", version: global.VERSION }));
app.use("/mcp", mcpRouter);

app.use("/api/mht", mhtRouter);
app.use("/api/hash", hashRouter);

if (process.env.NODE_ENV === "test") {
    app.use("/", (_, res) => res.status(200).send({ msg: "Ok" })); // return 200 as health check for playwright
}

// catch 404
app.use((req, res, next) => {
    res.status(404).send({ msg: "Not Found" }); // update to use UI error page, when built
});

/**
 * Normalize a port into a number, string, or false.
 */
const normalizePort = val => {
    let port = parseInt(val, 10);

    // named pipe
    if (isNaN(port)) return val;

    // port number
    if (port >= 0) return port;
    return false;
};

/**
 * Event listener for HTTP server "error" event.
 */
const onError = error => {
    if (error.syscall !== "listen") {
        throw error;
    }

    let bind = typeof port === "string" ? "Pipe " + global.PORT : "Port " + global.PORT;

    // handle specific listen errors with friendly messages
    switch (error.code) {
        case "EACCES":
            logger.error(bind + " requires elevated privileges");
            process.exit(1);
            break;
        case "EADDRINUSE":
            logger.error(bind + " is already in use");
            process.exit(1);
            break;
        default:
            logger.error("Unknown error occurred: " + error);
            setTimeout(() => {
                try {
                    // I'm not sure this will do what you expect
                    logger.info("Attempting to listen again");
                    server.close();
                    server.listen(global.PORT);
                } catch (e) {
                    logger.error("Failed to listen again");
                }
            }, 1000);
            // throw error;
    }
};

// catch all exception handler
process.on("uncaughtException", (err) => { logger.error("Caught in catch-all: " + err); console.error(err); });

/**
 * Event listener for HTTP server "listening" event.
 */
const onListening = () => {
    let addr = server.address();
    let bind = typeof addr === "string" ? "pipe " + addr : "port " + addr.port;
    logger.info("Listening on " + bind);
};

// Get port from environment (or 5000) and store in Express.
global.PORT = normalizePort(process.env.PORT || "5000");
app.set("port", global.PORT);

// Create HTTP server.
const http = require("http");
const server = http.createServer(app);
server.on("error", onError);
server.on("listening", onListening);

const { makeBool } = require("./utils");
if (process.env.NODE_ENV !== "test" ||
    (process.env.NODE_ENV === "test" && makeBool(process.env.RUN_SERVER))) {
    // only run the server if not in test mode, or if in test mode and RUN_SERVER env var is true
    server.listen(global.PORT);
}

module.exports = app;