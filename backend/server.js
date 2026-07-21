// server.js

const express = require("express");
const helmet =
  require("helmet");
const cors = require("cors");
const path = require("path");

// SOCKET IMPORTS
const http = require("http");

const { Server } =
  require("socket.io");

  const jwt = require("jsonwebtoken");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const productRoutes = require("./routes/productRoutes");
const cartRoutes = require("./routes/cartRoutes");
const orderRoutes = require("./routes/orderRoutes");
const creditRoutes = require("./routes/creditRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const adminRoutes = require("./routes/adminRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const addressRoutes = require("./routes/addressRoutes");
const invoiceRoutes = require("./routes/invoiceRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const otpRoutes = require("./routes/otpRoutes");
const logger = require("./utils/logger");

require("./config/db");

const app = express();
app.disable("x-powered-by");

// CREATE HTTP SERVER
const server = http.createServer(app);


// SOCKET SERVER
const io =
  new Server(
    server,
    {
     cors: {
  origin: [
    "http://localhost:5173",
    "https://sujamart.vercel.app"
  ],
  methods: ["GET", "POST"],
  credentials: true
}
    }
  );


// SOCKET CONNECTION

io.use((socket, next) => {
  const token = socket.handshake.auth.token;

  if (!token) {
    return next(new Error("Authentication Error"));
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    socket.user = decoded;

    next();
  } catch (err) {
    next(new Error("Invalid Token"));
  }
});



io.on(
  "connection",
  (socket) => {


    console.log(
      "Socket Connected:",
      socket.id
    );


    const userId = socket.user.id;


    if (userId) {


      socket.join(
        `user_${userId}`
      );


      console.log(
        "Joined Room:",
        `user_${userId}`
      );


    }



    socket.on(
      "disconnect",
      () => {


        console.log(
          "Socket Disconnected"
        );


      }
    );


  });


// make io available in controllers

app.set(
  "io",
  io
);



app.use(
  helmet({
    crossOriginResourcePolicy: {
      policy: "cross-origin"
    }
  })
);


app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://sujamart.vercel.app"
    ],
    methods: [
      "GET",
      "POST",
      "PUT",
      "DELETE"
    ],
    credentials: true
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  "/uploads",
  express.static(
    path.join(
      __dirname,
      "uploads"
    )
  )
);

app.use("/api/auth", authRoutes);

app.use("/api/user", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/admin", adminRoutes);

app.use(
  "/api/categories",
  categoryRoutes
);
app.use("/api/credit", creditRoutes);

app.use(
  "/api/payment",
  paymentRoutes
);

app.use(
  "/api/address",
  addressRoutes
);

app.use(
  "/api/invoice",
  invoiceRoutes
);

app.use(
  "/api/otp",
  otpRoutes
);

app.use(
  "/api/notifications",
  notificationRoutes
);


app.get("/", (req, res) => {
  res.send("Sujatha Kiranam Backend Running");
});

const PORT =
  process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  logger.info({
  action: "SERVER_START",
  port: PORT,
});

});