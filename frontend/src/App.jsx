import Register from "./pages/Register/Register.jsx";
import Login from "./pages/Login/Login.jsx";
import Home from "./pages/Home/Home.jsx";
import './App.css'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import Ingredients from './pages/Ingredients/Ingredients.jsx'
import MyIngredients from './pages/MyIngredients/MyIngredients.jsx'
import Recipes from './pages/RecipesList/RecipesList.jsx'
import Recipe from './pages/Recipe/Recipe.jsx'
import RecipeCreate from './pages/RecipeCreate/RecipeCreate.jsx'
import Favorites from './pages/Favorites/Favorites.jsx'
import { Header } from './components/Header/Header.jsx'
import Profile from "./pages/Profile/Profile.jsx";
import ProfileView from "./pages/ProfileView/ProfileView.jsx";

function App() {
  return (
    <BrowserRouter>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/ingredients" element={<Ingredients />} />
        <Route path="/my-ingredients" element={<MyIngredients />} />
        <Route path='/recipes' element={<Recipes />} />
        <Route path='/recipe/:id' element={<Recipe />} />
        <Route path='/recipes/create' element={<RecipeCreate />} />
        <Route path="/favorites" element={<Favorites />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/profile/:id" element={<ProfileView />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

