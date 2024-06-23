import express from "express";
import bodyParser from "body-parser";
import multer from "multer";
import cors from "cors";
import pg from "pg";
import dotenv from "dotenv";
import path from "path";
import { Server } from "socket.io";
import http from "http";

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // You can restrict this to your specific frontend URL
    methods: ["GET", "POST"]
  }
});
const port = 9000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

const db = new pg.Client({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT,
});
db.connect();

const profstorage = multer.diskStorage({
  destination: function (req, file, cb) {
    return cb(null, "./public/");
  },
  filename: function (req, file, cb) {
    return cb(
      null,
      file.fieldname + "_" + Date.now() + path.extname(file.originalname)
    );
  },
});

const profupload = multer({ storage: profstorage });

app.post("/upload/post", profupload.single("post"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded." });
  }
  const image = req.file.filename;
  const userId = req.body.uid;
  const description = req.body.description;

  try {
    const uploaded = await db.query(
      "INSERT INTO posts (userid, image, description) VALUES ($1, $2, $3)",
      [userId, image, description]
    );
    if (uploaded.rowCount === 0) {
      console.log("Error uploading the posts");
      return res.json({ error: "Error Uploading the posts" });
    } else {
      console.log("Post uploaded successfully");
      return res.json({ msg: "successfull stored the data", route: "home" });
    }
  } catch (error) {
    console.error(error);
    return res.json({ error: "Internal server error" });
  }
});

app.post("/signup", async (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  try {
    const checkresult = await db.query(
      "SELECT * FROM users WHERE username = $1",
      [username]
    );
    if (checkresult.rows.length > 0) {
      console.log("User Already Exists");
      return res.json({ error: "User already exists", route: "login" });
    } else {
      const result = await db.query(
        "INSERT INTO users (username, passwords) VALUES ($1, $2) RETURNING *",
        [username, password]
      );
      return res
        .json({
          id: result.rows[0].id,
        })
        .end();
    }
  } catch (error) {
    console.error(error);
    return res.json({ error: "Internal Server Error" });
  }
});

app.post("/login", async (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  try {
    const checkresult = await db.query(
      "SELECT * FROM users WHERE username = $1 and passwords = $2",
      [username, password]
    );
    if (checkresult.rows.length > 0) {
      return res.json(checkresult.rows[0]);
    } else {
      return res
        .json({
          error: "User not exists",
        })
        .end();
    }
  } catch (error) {
    console.error(error);
    return res.json({ error: "Internal Server Error" });
  }
});

app.patch("/like", async (req, res) => {
  const pid = req.body.pid;
  try {
    const result = await db.query(
      "UPDATE posts SET likes = likes + 1 WHERE id = $1",
      [pid]
    );
    if (result.rowCount > 0) {
      // Notify all connected clients about the like event
      io.emit("like", { id: pid });
      return res.json({ msg: "Successfully liked" }).end();
    } else {
      return res.status(404).json({ error: "Post not found" }).end();
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/postsdata", async (req, res) => {
  const posts = await db.query(
    "SELECT * FROM users JOIN posts on users.id = posts.userid"
  );
  return res.json(posts.rows).end();
});

io.on("connection", (socket) => {
  console.log("A user connected");
  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

server.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});