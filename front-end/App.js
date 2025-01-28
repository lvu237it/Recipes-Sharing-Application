import React, { useEffect, useState } from 'react';
import { Button, Image, View, StyleSheet, FlatList, Text } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import * as FileSystem from 'expo-file-system';

export default function App() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [recipes, setRecipes] = useState([]);

  useEffect(() => {
    fetch('http://10.0.2.2:3000/recipes')
      .then((response) => response.json()) // Đợi đến khi dữ liệu JSON được phân tích
      .then((responseAfterJsonParse) => {
        setRecipes(responseAfterJsonParse.data); // Cập nhật state với dữ liệu nhận được
      })
      .catch((error) => console.error('Error fetching recipes:', error));

    console.log('selectedImage', selectedImage);
  }, [selectedImage]);

  useEffect(() => {
    console.log('selectedImage', selectedImage);
    console.log('selectedImage typeof', typeof selectedImage);
    console.log('process.env.expo', process.env.EXPO_PUBLIC_CLOUDINARY_NAME);
  }, [selectedImage]);

  const handleSelectImage = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      alert("You've refused to allow this app to access your photos!");
      return;
    }

    const pickerResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!pickerResult.canceled) {
      setSelectedImage(pickerResult.assets[0].uri);
    }
  };

  const handleCameraLaunch = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    if (permissionResult.granted === false) {
      alert("You've refused to allow this app to access your camera!");
      return;
    }

    const pickerResult = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!pickerResult.canceled) {
      setSelectedImage(pickerResult.uri);
    }
  };

  const uploadImageToCloudinary = async (fileUri) => {
    try {
      // Đọc file từ đường dẫn URI
      const fileBase64 = await FileSystem.readAsStringAsync(fileUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Tạo form data với file đã chuyển đổi
      const formData = new FormData();
      formData.append('file', `data:image/jpeg;base64,${fileBase64}`);
      formData.append(
        'upload_preset',
        'mma301-recipes-sharing-app-single-image-for-recipe'
      );

      const response = await axios.post(
        `https://api.cloudinary.com/v1_1/${process.env.EXPO_PUBLIC_CLOUDINARY_NAME}/image/upload`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      return response.data.secure_url; // Trả về URL ảnh đã upload
    } catch (error) {
      console.error('Error uploading to Cloudinary:', error);
    }
  };

  const handlePostRecipeRequest = async () => {
    const formData = new FormData();
    formData.append('foodCategories', JSON.stringify(['món nộm']));
    formData.append('title', 'test');
    formData.append('description', 'test');
    formData.append('ingredients', JSON.stringify(['test']));
    formData.append(
      'steps',
      JSON.stringify([{ stepNumber: 1, description: 'test' }])
    );
    formData.append('owner', '679340974e7de09465f4c743');
    formData.append('sources', JSON.stringify(['test']));

    let resultUploadImageToCloudinary;
    if (selectedImage) {
      try {
        // Upload ảnh trực tiếp lên Cloudinary
        resultUploadImageToCloudinary = await uploadImageToCloudinary(
          selectedImage
        );
        if (resultUploadImageToCloudinary.length > 0) {
          console.log('Upload image to cloudinary successfully!');

          formData.append('imageUrl', resultUploadImageToCloudinary); // Đính kèm URL ảnh đã upload

          // Tiến hành gửi yêu cầu POST đến backend với ảnh đã upload
          const response = await axios.post(
            'http://10.0.2.2:3000/recipes/create-new-recipe',
            formData,
            {
              headers: {
                'Content-Type': 'application/json',
              },
            }
          );

          if (response.status === 200) {
            console.log('Create recipe post successfully!');
          } else {
            console.log('Create recipe post failed!');
          }
        }
      } catch (error) {
        console.error('Error uploading image to Cloudinary:', error);
      }
    } else {
      try {
        // Tiến hành gửi yêu cầu POST đến backend với ảnh đã upload
        const response = await axios.post(
          'http://10.0.2.2:3000/recipes/create-new-recipe',
          formData,
          {
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );
        if (response.status === 200) {
          console.log('Create recipe post successfully!');
        }
      } catch (error) {
        console.log('Create recipe post failed!', error);
      }
    }
  };

  const Recipe = ({ recipe }) => (
    <View style={styles.item}>
      <Text style={styles.title}>{recipe.title}</Text>
      <Text>{recipe.description}</Text>
    </View>
  );

  const renderRecipe = ({ item }) => <Recipe recipe={item} />;
  return (
    <View style={styles.container}>
      <Button title='Chọn ảnh' onPress={handleSelectImage} />
      {/* <Button title='Chụp ảnh' onPress={handleCameraLaunch} /> */}
      {selectedImage && (
        <Image source={{ uri: selectedImage }} style={styles.image} />
      )}
      <Button title='Gửi request POST' onPress={handlePostRecipeRequest} />
      <View style={styles.list}>
        <FlatList
          data={recipes}
          keyExtractor={(recipe) => recipe._id}
          renderItem={renderRecipe}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
  },
  image: {
    width: 200,
    height: 200,
    marginTop: 20,
  },
  item: {
    backgroundColor: '#f9c2ff',
    padding: 20,
    marginVertical: 8,
    marginHorizontal: 16,
    width: '80%',
  },
  list: {
    flex: 1,
    margin: 5,
    padding: 10,
  },
  title: {
    fontSize: 32,
  },
});
