/*
Định nghĩa router xử lý từng request từ phía client gửi tới server
*/

const express = require('express');
const router = express.Router();
const recipeController = require('../controllers/recipeController');
const upload = require('../utils/multerConfig'); // Import multer config

// Gọi tới các module xử lý request từ controller
router.get('/', recipeController.getAllRecipes);
router.post(
  '/create-new-recipe',
  upload.single('imageFile'),
  recipeController.createNewRecipe
);
router.patch('/update-recipe/:recipeId', recipeController.updateRecipe);
router.patch('/delete-recipe/:recipeId', recipeController.deleteRecipe);

module.exports = router;
