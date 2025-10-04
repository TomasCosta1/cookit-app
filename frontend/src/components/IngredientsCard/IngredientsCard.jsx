import React from "react";
import "./IngredientsCard.css";
import Button from "../Button/Button";

export const IngredientsCard = (props = {}) => {
  const { id, name, selected, removeMyIngredient, setRows, addMyIngredient } = props;
  const displayName = name;
  return (
    <li key={id} className="ingredients-item card">
      <span>{displayName}</span>
      {selected ? (
        <Button
          variant="danger"
          size="small"
          onClick={() => {
            if (id != null && removeMyIngredient) removeMyIngredient(id);
            if (setRows) setRows((r) => [...r]);
          }}
        >
          Quitar
        </Button>
      ) : (
        <Button
          variant="primary"
          size="small"
          onClick={() => {
            if (addMyIngredient) addMyIngredient({ id, name: displayName });
            if (setRows) setRows((r) => [...r]);
          }}
        >
          Agregar
        </Button>
      )}
    </li>
  );
};
