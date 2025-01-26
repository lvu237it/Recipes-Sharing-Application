const multer = require('multer');
const path = require('path');

// Cấu hình bộ nhớ tạm
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../assets/temp')); // Lưu file vào thư mục 'temp' trong project
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  },
});

// Bộ lọc loại file (chỉ chấp nhận ảnh)
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

// Giới hạn kích thước file
const limits = {
  fileSize: 5 * 1024 * 1024, // 5MB
};

const upload = multer({ storage, fileFilter, limits });

module.exports = upload;
