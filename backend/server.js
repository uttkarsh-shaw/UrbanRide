require("dotenv").config();

const http = require("http");
const { Server } = require("socket.io");
const app = require("./app");
const connectDB = require("./config/db");
const { setupSocket } = require("./socket/socket");

const DEFAULT_PORT = 3000;
const MAX_PORT_ATTEMPTS = 10;

const getStartPort = () => {
  const configuredPort = Number(process.env.PORT);
  return Number.isInteger(configuredPort) && configuredPort > 0
    ? configuredPort
    : DEFAULT_PORT;
};

const createServer = () => {
  const server = http.createServer(app);

  const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || "*"
    }
  });

  setupSocket(io);
  global.io = io;

  return { server, io };
};

const listenOnAvailablePort = (server, port, attemptsLeft) => {
  return new Promise((resolve, reject) => {
    const handleError = (error) => {
      server.off("listening", handleListening);

      if (error.code === "EADDRINUSE" && attemptsLeft > 1) {
        const nextPort = port + 1;
        console.warn(
          `Port ${port} is already in use. Trying port ${nextPort}...`
        );

        return resolve(listenOnAvailablePort(server, nextPort, attemptsLeft - 1));
      }

      if (error.code === "EADDRINUSE") {
        return reject(
          new Error(
            `Ports ${getStartPort()}-${port} are busy. Stop the existing backend process or set PORT to a free port.`
          )
        );
      }

      return reject(error);
    };

    const handleListening = () => {
      server.off("error", handleError);
      resolve(port);
    };

    server.once("error", handleError);
    server.once("listening", handleListening);
    server.listen(port);
  });
};

const startServer = async () => {
  await connectDB();

  const { server, io } = createServer();
  const port = await listenOnAvailablePort(
    server,
    getStartPort(),
    MAX_PORT_ATTEMPTS
  );

  console.log(`Server running on port ${port}`);

  const shutdown = (signal) => {
    console.log(`${signal} received. Closing server...`);
    io.close();
    server.close(() => {
      console.log("Server closed");
      process.exit(0);
    });
  };

  process.once("SIGINT", shutdown);
  process.once("SIGTERM", shutdown);

  return { server, io, port };
};

if (require.main === module) {
  startServer().catch((error) => {
    console.error(`Server startup failed: ${error.message}`);
    process.exit(1);
  });
}

module.exports = startServer;
