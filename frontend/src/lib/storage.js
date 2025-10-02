const KEY = 'my_ingredients'

function read() {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function write(list) {
  localStorage.setItem(KEY, JSON.stringify(list))
}

export function getMyIngredients() {
  return read()
}

export function addMyIngredient(ingredient) {
  const list = read()
  if (!list.find((it) => it.id === ingredient.id)) {
    list.push({ id: ingredient.id, name: ingredient.name ?? ingredient.nombre })
    write(list)
  }
  return list
}

export function removeMyIngredient(id) {
  const list = read().filter((it) => it.id !== id)
  write(list)
  return list
}

export function isInMyIngredients(id) {
  return read().some((it) => it.id === id)
}


