import axios from 'axios';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View, FlatList } from 'react-native';

export default function App() {
  const [recipes, setRecipes] = useState([]);

  useEffect(() => {
    async function getRecipes() {
      const result = await axios.get('http://10.0.2.2:3000/recipes');
      setRecipes(result.data);
    }
    getRecipes();
  }, []);

  useEffect(() => {
    console.log('Recipes:', recipes);
  }, [recipes]);

  const Recipe = ({ title, owner }) => (
    <View>
      <Text>{title}</Text>
      <Text>{owner}</Text>
    </View>
  );

  const renderRecipe = ({ item }) => (
    <Recipe title={item.title} owner={item.owner} />
  );

  return (
    <View style={styles.container}>
      <Text>Open up App.js to start working on your app!</Text>
      <StatusBar style='auto' />

      <View style={styles.list}>
        <FlatList
          data={recipes}
          keyExtractor={(recipe) => recipe._id}
          renderItem={renderRecipe}
        />
      </View>
      <Text>123!</Text>
      <Text>123!</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: {
    backgroundColor: 'green',
    flex: 1, // Thêm flex: 1 để FlatList chiếm toàn bộ chiều cao còn lại
  },
});
