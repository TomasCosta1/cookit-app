import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getMyIngredients, removeMyIngredient } from '../../lib/storage.js'
import './MyIngredients.css'

export default function MyIngredients() {
  const [rows, setRows] = useState([])

  useEffect(() => {
    setRows(getMyIngredients())
  }, [])

  function onRemove(id) {
    setRows(removeMyIngredient(id))
  }

  return (
    <div className="myingredients-page">
      <h2>Mis ingredientes</h2>
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <Link to="/ingredients" className="btn btn-primary">Volver a ingredientes</Link>
      </div>
      {rows.length === 0 && <p>No tenés ingredientes guardados.</p>}
      <ul className="myingredients-list">
        {rows.map((it) => (
          <li key={it.id} className="myingredients-item card">
            <span>{it.name}</span>
            <button className="btn btn-danger" onClick={() => onRemove(it.id)}>Quitar</button>
          </li>
        ))}
      </ul>
    </div>
  )
}


