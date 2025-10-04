import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getMyIngredients, removeMyIngredient } from '../../lib/storage.js'
import './MyIngredients.css'
import Button from '../../components/Button/Button'

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
      <div className="myingredients-actions">
        <Button 
          variant="secondary" 
          size="medium"
          onClick={() => window.location.href = '/ingredients'}
        >
          Volver a ingredientes
        </Button>
      </div>
      {rows.length === 0 && (
        <div className="no-ingredients">
          <p>No tenés ingredientes guardados.</p>
          <p>¡Ve a la sección de ingredientes para agregar algunos!</p>
        </div>
      )}
      <ul className="myingredients-list">
        {rows.map((it) => (
          <li key={it.id} className="myingredients-item card">
            <span>{it.name}</span>
            <Button variant="danger" size="small" onClick={() => onRemove(it.id)}>
              Quitar
            </Button>
          </li>
        ))}
      </ul>
    </div>
  )
}


