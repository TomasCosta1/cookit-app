import React from 'react'
import { NavLink } from 'react-router-dom'
import './Header.css'
import DinnerDiningIcon from '@mui/icons-material/DinnerDining';
import PersonIcon from '@mui/icons-material/Person';
import HomeIcon from '@mui/icons-material/Home';
import StarIcon from '@mui/icons-material/Star';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCarrot } from '@fortawesome/free-solid-svg-icons';

function CarrotIcon() {
  return <FontAwesomeIcon icon={faCarrot} style={{ fontSize: '1.6rem', display: 'block' }}/>;
}

export const Header = () => {
  return (
    <nav className='nav'>
        <NavLink to="/" className={({ isActive }) => isActive ? 'active' : ''}><HomeIcon /></NavLink>
        <NavLink to="/ingredients" className={({ isActive }) => isActive ? 'active' : ''}><CarrotIcon /></NavLink>
        <NavLink to="/recipes" className={({ isActive }) => 'recipesIcon' + (isActive ? ' active' : '')}><DinnerDiningIcon /></NavLink>
        <NavLink to="/favorites" className={({ isActive }) => isActive ? 'active' : ''}><StarIcon /></NavLink>
        <NavLink to="/profile" className={({ isActive }) => isActive ? 'active' : ''}><PersonIcon /></NavLink>
      </nav>
  )
}
