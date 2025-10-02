import React from "react";

export const IngredientsCard = (props = {}) => {
  const { id, name, selected, removeMyIngredient, setRows, addMyIngredient } = props;
  const displayName = name;
  return (
    <li key={id} className="ingredients-item card">
      <span>{displayName}</span>
      {selected ? (
        <button
          className="btn btn-danger"
          onClick={() => {
            if (id != null && removeMyIngredient) removeMyIngredient(id);
            if (setRows) setRows((r) => [...r]);
          }}
        >
          Quitar
        </button>
      ) : (
        <button
          className="btn btn-primary"
          onClick={() => {
            if (addMyIngredient) addMyIngredient({ id, name: displayName });
            if (setRows) setRows((r) => [...r]);
          }}
        >
          Agregar
        </button>
      )}
    </li>
  );
};
