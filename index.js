const express = require("express");
const cors = require("cors");
const socket = require("socket.io");
const authentication = require("./Routes/Authentication");
const chat = require("./Routes/Chat");
const group = require("./Routes/GroupChat");
const mongo = require("./Models/Mongo");
const common = require("./Services/Common");

const app = express();

const port = process.env.PORT || 5000;

require("dotenv").config({ path: "./.env" });

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS, PUT, PATCH, DELETE"
  );
  res.header(
    "Access-Control-Allow-Headers",
    "x-access-token, Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

app.get("/", (req, res) => {
  res.send("Welcome to Chit Chat!");
});

app.use("/authentication", authentication);
app.use("/chat", chat);
app.use("/group", group);

const connectToMongo = async () => {
  await mongo()
    .then((mongoose) => {
      ("mongo db connected");
    })
    .catch((err) => {
      console.log(err);
    });
};

connectToMongo();

const server = app.listen(port, () => {
  console.log(`server is running on port ${port}`);
});

// Socket Connections
let onlineUserArray = [];

const removeUser = (socketid) => {
  onlineUserArray = onlineUserArray.filter((user) => user.socketid != socketid);
};

const io = socket(server, {
  cors: {
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  socket.on("add-user", (data) => {
    let decrypteduserid = common.Decrypt(data, process.env.SECERET_KEY);

    onlineUserArray.push({ userid: decrypteduserid, socketid: socket.id });
    io.emit("online-users", onlineUserArray);

    socket.on("send-message", (data) => {
      onlineUserArray.map((user) => {
        if (user.userid === data.receiverid) {
          io.to(user.socketid).emit("receive-message", data);
        }
      });
    });

    socket.on("user-typing", (data) => {
      onlineUserArray.map((user) => {
        if (user.userid === data) {
          io.to(user.socketid).emit("receiver-typing", data);
        }
      });
    });

    socket.on("user-stops-typing", (data) => {
      onlineUserArray.map((user) => {
        if (user.userid === data) {
          io.to(user.socketid).emit("receiver-stops-typing", data);
        }
      });
    });

    socket.on("contact-added", (data) => {
      onlineUserArray.map((user) => {
        if (user.userid === data.receiverid) {
          io.to(user.socketid).emit("reload-contacts", data);
        }
      });
    });
  });

  socket.on("join-group", (groupid) => {
    socket.join(groupid);
  });

  socket.on("send-message-to-group", (data) => {
    io.to(data.groupid).emit("receive-message-to-group", data);
  });

  socket.on("user-typing-in-group", (data) => {
    let userid = common.Decrypt(data.userid, process.env.SECERET_KEY);
    io.to(data.groupid).emit("someone-typing-in-group", userid);
  });

  socket.on("user-stops-typing-in-group", (groupid) => {
    io.to(groupid).emit("stops-typing-in-group", groupid);
  });

  socket.on("call-user", (data) => {
    onlineUserArray.map((user) => {
      if (user.userid === data.userid) {
        io.to(user.socketid).emit("incoming-call", data);
      }
    });
  });

  socket.on("cancle-call", (data) => {
    onlineUserArray.map((user) => {
      if (user.userid === data.userid) {
        io.to(user.socketid).emit("call-cancled", data);
      }
    });
  });

  socket.on("reject-incoming-call", (data) => {
    onlineUserArray.map((user) => {
      if (user.userid === data.userid) {
        io.to(user.socketid).emit("call-rejected", data);
      }
    });
  });

  socket.on("accept-incoming-call", (data) => {
    onlineUserArray.map((user) => {
      if (user.userid === data.userid) {
        io.to(user.socketid).emit("call-Accepted", data);
      }
    });
  });

  socket.on("hang-call", (data) => {
    onlineUserArray.map((user) => {
      if (user.userid === data.userid) {
        io.to(user.socketid).emit("call-Hanged", data);
      }
    });
  });

  socket.on("disconnect", () => {
    removeUser(socket.id);
    io.emit("online-users", onlineUserArray);
  });
});
