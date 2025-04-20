import express from "express";
import flashcardRoutes from "./routes/flashcardRoutes.js";
import path from "path";
import { pool } from "./config/db.js";
import methodOverride from "method-override";

const app = express();

// Middleware setup
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(process.cwd(), "public")));
app.use(methodOverride('_method', {
  methods: ['POST', 'GET']
}));

// Template engine configuration
app.set("view engine", "ejs");
app.set("views", path.join(process.cwd(), "views"));

// Logging middleware
const loggingMiddleware = (req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.url}`);
  next();
};

app.use(loggingMiddleware);
app.use("/", flashcardRoutes);

// 404 Error handler
app.use((req, res) => {
  res.status(404).send("404 Not Found.\n");
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Flashcard app running at http://localhost:${PORT}/`);
});
