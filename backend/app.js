import express from "express";
import cors from "cors";
import expressRateLimit from "express-rate-limit";
import helmet from "helmet";
const app = express();

import routes from "./route.js";

//middlewares
const corsOptions = {
  origin: "*",
};
app.use(cors(corsOptions));
//pre flight request config
app.options("*", cors(corsOptions));
app.set("trust proxy", 1);

app.use(helmet());
app.use(
  expressRateLimit({
    windowMs: 60 * 1000,
    max: 7,
  }),
);
app.use(express.json());

app.use("/api", routes);

//server initialization
const port = process.env.PORT || 2626;
app.listen(port, () => {
  console.log(`Server is at port ${port}... :)`);
});
