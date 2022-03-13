const mongoose = require("mongoose");
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");

const user_routes = require("./routes/User_Routes");

const app = express();
const port = process.env.PORT || 5000;

app.use(morgan("dev"));
app.use(
  cors({
    origin: "https://ecosystem-d05bc.web.app",
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());
app.use("/api", user_routes);

app.listen(port, () => {
  console.log(`server listening on ${port}`);
  mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => console.log("connected to mongodb"))
    .catch(() => console.log("DB not connected"));
});
