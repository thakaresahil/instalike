import express from "express";
import bodyParser from "body-parser";
import multer from "multer";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import bcrypt from "bcrypt";
import mongoose from "mongoose";
import { Server } from "socket.io";
import http from "http";
import jwt from "jsonwebtoken";

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // You can restrict this to your specific frontend URL
    methods: ["GET", "POST", "PATCH"],
  },
});
const port = 9000;
const saltRounds = 10;
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

const secretKey = process.env.SESSION_SECRET;
mongoose
  .connect("mongodb://127.0.0.1:27017/instalike")
  .then(() => {
    console.log("Connected to Mongo");
  })
  .catch((err) => {
    console.log("Mongo Error", err);
  });

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  profilePicture: {
    type: String,
    default: "",
  },
  followers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  following: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  bio: {
    type: String,
    default: "",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const postSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    max: 500,
  },
  likes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Like",
    },
  ],
  comments: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const commentSchema = new mongoose.Schema({
  postId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Post",
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const likeSchema = new mongoose.Schema({
  postId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Post",
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const User = mongoose.model("User", userSchema);
const Post = mongoose.model("Post", postSchema);
const Comment = mongoose.model("Comment", commentSchema);
const Like = mongoose.model("Like", likeSchema);

const profstorage = multer.diskStorage({
  destination: function (req, file, cb) {
    return cb(null, "./public/posts");
  },
  filename: function (req, file, cb) {
    return cb(
      null,
      file.fieldname + "_" + Date.now() + path.extname(file.originalname)
    );
  },
});

const profilestorage = multer.diskStorage({
  destination: function (req, file, cb) {
    return cb(null, "./public/profile");
  },
  filename: function (req, file, cb) {
    return cb(
      null,
      file.fieldname + "_" + Date.now() + path.extname(file.originalname)
    );
  },
});
const profupload = multer({ storage: profstorage });
const profileupload = multer({ storage: profilestorage });

const generateToken = (user) => {
  return jwt.sign({ id: user._id }, secretKey, { expiresIn: "3d" });
};

const verifyToken = (token) => {
  try {
    return jwt.verify(token, secretKey);
  } catch (err) {
    return null;
  }
};

const authenticateToken = (req, res, next) => {
  const token = req.body.token;
  if (!token) return res.sendStatus(401);

  const verifiedUser = verifyToken(token);
  if (!verifiedUser) return res.sendStatus(403);

  req.user = verifiedUser;
  next();
};

app.post("/upload/post", profupload.single("postImg"), async (req, res) => {
  if (!req.file) {
    console.log("No File Available");
    return res.status(400).json({ error: "No file uploaded." });
  }
  const imagee = req.file.filename;
  const userid = req.body.uid;
  const descriptions = req.body.description;
  try {
    const uploaded = await Post.insertMany([
      {
        userId: userid,
        image: imagee,
        description: descriptions,
      },
    ]);
    return res.json({ message: "Successfully Posted", route: "home" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/signup", async (req, res) => {
  const usernamee = req.body.username;
  const emaile = req.body.email;
  const passworde = req.body.password;
  const hashPassword = await bcrypt.hash(passworde, saltRounds);
  try {
    const user = await User.find({
      $and: [{ username: { $eq: usernamee } }, { email: { $eq: emaile } }],
    });
    if (user.length > 0) {
      res.status(201).json({ message: "User Already Exist" });
    } else {
      await User.insertMany([
        {
          username: usernamee,
          email: emaile,
          password: hashPassword,
        },
      ]);
      res.status(201).send({ message: "User created successfully" });
    }
  } catch (error) {
    console.log("something happened", error);
    if (error.code === 11000) {
      res.status(400).json({ message: "Please Use Different Credentials" });
    }
    res.status(500).json({ message: "Internal server error" });
  }
});

app.post("/login", async (req, res) => {
  const emaile = req.body.email;
  const passworde = req.body.password;
  try {
    const checkresult = await User.find({ email: { $eq: emaile } });

    if (
      checkresult.length > 0 &&
      (await bcrypt.compare(passworde, checkresult[0].password))
    ) {
      const token = generateToken(checkresult[0]);
      return res.json({ token, uid: checkresult[0]._id });
    } else {
      return res
        .json({
          error: "Invalid Credentials",
        })
        .end();
    }
  } catch (error) {
    console.error(error);
    return res.json({ error: "Internal Server Error" });
  }
});

app.post("/upload/profilepicture",profileupload.single("profileImage"), async (req, res) => {
  if (!req.file) {
    console.log("No File Available");
    return res.status(400).json({ error: "No file uploaded." });
  }
  const imagee = req.file.filename;
  const userId = req.body.uid;
  try {
    const profilupload = await User.findByIdAndUpdate(userId, {$set: {profilePicture: imagee}});
    return res.json({ message: "Successfully Posted", route: "profile" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

app.patch("/like", authenticateToken, async (req, res) => {
  const postId = req.body.pid;
  const userId = req.body.uid;
  try {
    const isLikedorNot = await Like.findOne({
      $and: [{ postId: { $eq: postId } }, { userId: { $eq: userId } }],
    });
    if (isLikedorNot !== null) {
      return res.json({ messaeg: "Already Liked" }).end();
    } else {
      const like = new Like({ postId, userId });
      await like.save();
      await Post.findByIdAndUpdate(postId, { $push: { likes: like._id } });
      io.emit("like", { id: postId });
      return res.json({ message: "Successfully Liked" }).end();
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

app.patch("/post/comment", authenticateToken, async (req, res) => {
  const postId = req.body.pid;
  const userId = req.body.uid;
  const text = req.body.comment;
  try {
    const comment = new Comment({ postId, userId, text });
    await comment.save();
    await Post.findByIdAndUpdate(postId, { $push: { comments: comment._id } });
    io.emit("comment", { id: postId });
    return res.json({ message: "Successfully Commented" });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ messaeg: "Not able to comment", error: "Internal server error" });
  }
});

app.post("/comments", async (req, res) => {
  const { postId, limit = 5, skip = 0 } = req.body;
  try {
    const comments = await Comment.find({ postId })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));
    res.json(comments);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});


app.get("/profile/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    const user = await User.findById(userId);
    const posts = await Post.find({ userId: userId }).sort({ createdAt: -1 });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ user, posts });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/postsdata", authenticateToken ,async (req, res) => {
  try {
    const posts = await Post.aggregate([
      {
        $lookup: {
          from: "users", // The name of the 'users' collection
          localField: "userId", // Field in the 'posts' collection
          foreignField: "_id", // Field in the 'users' collection
          as: "userDetails", // The resulting field to add to the 'posts' documents
        },
      },
      {
        $unwind: "$userDetails", // Deconstruct the array of userDetails
      },
    ]);
    return res.json(posts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
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
