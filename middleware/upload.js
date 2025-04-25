// const multer = require("multer");
// const path = require('path');

// const storage = multer.diskStorage({
//     destination: 'uploads/',
//     filename: (_, file, cb) => {
//         cb(null, Date.now() + path.extname(file.originalname));
//       },});

// const upload = multer({storage});
// module.exports = upload;

const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: '/root/projects/images',
  filename: (req, file, cb) => {
    cb(null, file.originalname); // or use unique filename if needed
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
});

module.exports = upload;
