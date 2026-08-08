const multer = require("multer");
const path = require("path");
const { v2: cloudinary } = require("cloudinary");
const { CloudinaryStorage } = require("multer-storage-cloudinary");

// 1. Authenticates your backend with your Cloudinary account
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// 2. Directs multer to stream incoming files straight to Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "sujamart_products", // Creates a folder in Cloudinary
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
  },
});

const upload = multer({ storage: storage });

module.exports = upload;




// const multer = require("multer");
// const path = require("path");

// const storage = multer.diskStorage({
//   destination: (
//     req,
//     file,
//     cb
//   ) => {
//     cb(null, "uploads/");
//   },

//   filename: (
//     req,
//     file,
//     cb
//   ) => {
//     cb(
//       null,
//       Date.now() +
//       path.extname(
//         file.originalname
//       )
//     );
//   },
// });

// const upload = multer({
//   storage,
// });

// module.exports = upload;