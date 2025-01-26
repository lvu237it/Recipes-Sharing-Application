const Recipe = require('../models/recipeModel');
const fs = require('fs');
const axios = require('axios');
const cloudinary = require('cloudinary').v2;

// Dùng cho trường hợp nào upload nhiều ảnh
// let indexCountUploadPostImage = 0;
// let indexCountUploadCommentImage = 0;

// const uploadImageToCloudinary = async (file) => {
//   const urlUpload = `https://api.cloudinary.com/v1_1/${process.env.cloudinary_name}/image/upload`;

//   const formData = new FormData();
//   // formData.append('file', {
//   //   uri: file.uri,
//   //   name: file.name,
//   //   type: file.type,
//   // });

//   //Tạo preset trên cloudinary
//   formData.append(
//     'upload_preset',
//     'mma301-recipes-sharing-app-single-image-for-recipe'
//   ); // Thay đổi với upload_preset của bạn
//   // formData.append('folder', 'images'); // Thay đổi với upload_preset của bạn
//   const publicId = file.name;
//   console.log('public_id', publicId); // Đặt tên file với thứ tự
//   formData.append('public_id', publicId); // Đặt tên file với thứ tự
//   // Normalizing file path before uploading to cloudinary
//   // Chuyển đường dẫn của file thành luồng đọc và gửi lên Cloudinary

//   // uri: Platform.OS === 'ios' ? file.uri.replace('file://', '') : file.uri,

//   const normalizedPath = file.uri.replace(/\\/g, '/'); // Normalize path for Windows
//   console.log('normalizedPath', normalizedPath);
//   formData.append('file', normalizedPath); // Đảm bảo file được truyền chính xác

//   //Gửi lên cloudinary và nhận lại public url
//   try {
//     const response = await axios.post(urlUpload, formData, {
//       headers: {
//         'Content-Type': 'multipart/form-data',
//       },
//     });

//     // console.log('response after uploading cloudinary', response);
//     return response.data.secure_url;
//   } catch (error) {
//     console.error('Error uploading to Cloudinary', error);
//     throw new Error('Upload to Cloudinary failed');
//   }
// };

exports.getAllRecipes = async (req, res) => {
  try {
    const results = await Recipe.find({});
    res.json({
      message: 'success',
      status: 200,
      data: results,
    });
  } catch (error) {
    console.log('error while getting recipes');
  }
};

// Cấu hình Cloudinary
cloudinary.config({
  cloud_name: process.env.cloudinary_name,
  api_key: process.env.cloudinary_api_key,
  api_secret: process.env.cloudinary_api_secret_key,
});

const uploadImageToCloudinary = async (file) => {
  console.log('filefilefile', file);
  // Chuẩn bị thông tin file từ frontend
  const uri = file.uri;

  // Gọi phương thức upload của cloudinary
  try {
    const response = await cloudinary.uploader.upload(uri, {
      upload_preset: 'mma301-recipes-sharing-app-single-image-for-recipe', // Upload preset bạn đã cấu hình
      public_id: file.name, // Đặt public_id là tên của file hoặc bạn có thể tạo một ID riêng
    });

    // Trả về URL của ảnh đã upload
    return response.secure_url;
  } catch (error) {
    console.error('Error uploading to Cloudinary', error);
    throw new Error('Upload to Cloudinary failed');
  }
};

exports.createNewRecipe = async (req, res) => {
  try {
    console.log('req.file', req.file);
    console.log('req.body', req.body);

    const {
      imageUrl,
      foodCategories,
      title,
      description,
      ingredients,
      steps,
      owner,
      sources,
    } = req.body;

    // Upload ảnh lên Cloudinary
    let imageUrlFromCloudinary = '';
    // file trong req.file được gửi qua từ multer sau khi xử lý
    if (req.file) {
      const file = {
        uri: req.file.path, // Đường dẫn tạm của file
        name: req.file.filename,
        type: req.file.mimetype,
      };
      imageUrlFromCloudinary = await uploadImageToCloudinary(file);

      // Tạo recipe mới
      const recentRecipeCreated = await Recipe.create({
        imageUrl: imageUrlFromCloudinary,
        foodCategories: JSON.parse(foodCategories),
        title,
        description,
        ingredients: JSON.parse(ingredients),
        steps: JSON.parse(steps),
        owner,
        sources: JSON.parse(sources),
      });

      // Xóa file tạm
      fs.unlinkSync(req.file.path);

      return res.json({
        message: 'success',
        status: 200,
        data: recentRecipeCreated,
      });
    }

    // Tạo recipe mới
    const recentRecipeCreated = await Recipe.create({
      imageUrl,
      foodCategories: JSON.parse(foodCategories),
      title,
      description,
      ingredients: JSON.parse(ingredients),
      steps: JSON.parse(steps),
      owner,
      sources,
    });

    res.json({
      message: 'success',
      status: 200,
      data: recentRecipeCreated,
    });
  } catch (error) {
    console.log('error while creating recipe', error);
    res.status(500).json({
      message: 'Server error',
      status: 500,
      error,
    });
  }
};

//Not working
// exports.createNewRecipe = async (req, res) => {
//   try {
//     const {
//       imageUrl,
//       foodCategories,
//       title,
//       description,
//       ingredients,
//       steps,
//       owner,
//       sources,
//     } = req.body;
//     console.log('req.body', req.body);

//     // Tạo recipe mới
//     const recentRecipeCreated = await Recipe.create({
//       imageUrl,
//       foodCategories: JSON.parse(foodCategories),
//       title,
//       description,
//       ingredients: JSON.parse(ingredients),
//       steps: JSON.parse(steps),
//       owner,
//       sources: JSON.parse(sources),
//     });

//     res.json({
//       message: 'success',
//       status: 200,
//       data: recentRecipeCreated,
//     });
//   } catch (error) {
//     console.log('error while creating recipe', error);
//     res.status(500).json({
//       message: 'Server error',
//       status: 500,
//       error,
//     });
//   }
// };

exports.updateRecipe = async (req, res) => {
  try {
    // Lấy tham số từ body của request từ client và đem xử lý tại server
    const {
      imageUrl,
      foodCategories,
      title,
      description,
      ingredients,
      steps,
      sources,
    } = req.body;
    const { recipeId } = req.params;

    // Kiểm tra sự tồn tại của recipeId trong cơ sở dữ liệu
    const existingRecipe = await Recipe.findById(recipeId);

    if (!existingRecipe) {
      return res.status(404).json({
        message: 'Recipe not found',
        status: 404,
      });
    }

    // Nếu tồn tại, tiếp tục cập nhật
    const updateData = {
      imageUrl,
      foodCategories,
      title,
      description,
      ingredients,
      steps,
      sources,
      updatedAt: Date.now(),
    };

    // Cập nhật món ăn với các trường có dữ liệu
    const recentUpdated = await Recipe.findByIdAndUpdate(recipeId, updateData, {
      new: true,
    });

    // Trả về kết quả hiển thị dưới dạng json
    res.json({
      message: 'Update successful',
      status: 200,
      data: recentUpdated,
    });
  } catch (error) {
    console.log('Error while updating recipe:', error);
    res.status(500).json({
      message: 'Server error',
      status: 500,
    });
  }
};

exports.deleteRecipe = async (req, res) => {
  try {
    // Lấy tham số từ request
    const { recipeId } = req.params;

    // Kiểm tra sự tồn tại của recipeId trong cơ sở dữ liệu
    const existingRecipe = await Recipe.findById(recipeId);

    if (!existingRecipe) {
      return res.status(404).json({
        message: 'Recipe not found',
        status: 404,
      });
    }

    // Tiến hành đánh dấu món ăn là đã xóa
    const recentDeleted = await Recipe.findByIdAndUpdate(
      recipeId,
      { isDeleted: true, deletedAt: Date.now(), updatedAt: Date.now() },
      { new: true }
    );

    // Trả về kết quả hiển thị dưới dạng json
    res.json({
      message: 'Delete successful',
      status: 200,
      data: recentDeleted,
    });
  } catch (error) {
    console.log('Error while deleting recipe:', error);
    res.status(500).json({
      message: 'Server error',
      status: 500,
    });
  }
};
