// const multer = require('multer')
import multer from "multer";
// const storage = multer.memoryStorage();
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./Assets/");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});
export const upload = multer({ storage: storage });
