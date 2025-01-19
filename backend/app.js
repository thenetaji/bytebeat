import express from "express";
import cors from "cors";
import expressRateLimit from "express-rate-limit";
import helmet from "helmet";
import morgan from "morgan";
import { logger as log } from "./utils/logger.js";
import routes from "./route.js";

const app = express();

const morganStream = {
  write: (message) => {
    log.info(message.trim());
  },
};

// Middlewares
const corsOptions = {
  origin: "*",
};
app.use(cors(corsOptions));
// Preflight request configuration
app.options("*", cors(corsOptions));

app.use(helmet());

app.use(
  expressRateLimit({
    windowMs: 60 * 1000,
    max: 7,
    message: "Too many requests from this IP, please try again later.",
  })
);

app.use(
  morgan(':method :url :status :response-time ms - :res[content-length] :user-agent', {
    stream: morganStream,
  })
);

app.use(express.json());

app.use("/api", routes);

// Server Initialization
const port = process.env.PORT || 2626;
app.listen(port, () => {
  log.info(`Server is running at PORT:${port}`);
});