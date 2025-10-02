import './App.css'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import Ingredients from './pages/Ingredients.jsx'
import MyIngredients from './pages/MyIngredients.jsx'
import { Header } from './components/Header.jsx'

function App() {
  return (
    <BrowserRouter>
      <Header/>
      <Routes>
        <Route path="/" element={<h1>Cookit!</h1>} />
        <Route path="/ingredients" element={<Ingredients />} />
        <Route path="/my-ingredients" element={<MyIngredients />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
