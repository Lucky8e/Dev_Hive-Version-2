import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
  })
);
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(express.json({ limit: "16kb" }));
app.use(cookieParser());

app.get("/health", (req, res) => {
  res.json({ status: "ok", message: "Devhive api is running perfectly" });
});

//-------------user routes and imports-------------//
import userRouter from "./routes/auth.routes.js";
app.use("/api/v1/users", userRouter);

//-------------snippet routes and imports-------------//
import snippetRouter from "./routes/snippet.route.js";
app.use("/api/v1/snippet", snippetRouter);

//-------------review routes and imports-------------//
import reviewRouter from "./routes/review.routes.js";
app.use("/api/v1/reviews", reviewRouter);

//-------------gallery routes and imports-------------//
import galleryRouter from "./routes/gallery.routes.js";
app.use("/api/v1/gallery", galleryRouter);

//-------------execute routes and imports-------------//
import ExecuteRouter from "./routes/execution.route.js";
app.use("/api/v1/execute", ExecuteRouter);

export default app;
