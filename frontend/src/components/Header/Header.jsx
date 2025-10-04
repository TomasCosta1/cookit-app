import React from 'react'
import { NavLink } from 'react-router-dom'
import './Header.css'

export const Header = () => {
  return (
    <nav className='nav'>
        <NavLink to="/" className={({ isActive }) => isActive ? 'active' : ''}>Inicio</NavLink>
        <NavLink to="/ingredients" className={({ isActive }) => isActive ? 'active' : ''}>Ingredientes</NavLink>
        <NavLink to="/recipes" className={({ isActive }) => isActive ? 'active' : ''}>Recetas</NavLink>
        {/* <NavLink to="/profile" className={({ isActive }) => isActive ? 'active' : ''}>Perfil</NavLink> */}
      </nav>
  )
}
