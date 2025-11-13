import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./RecipeCreate.css";
import Button from "../../components/Button/Button";
import { IngredientsCard } from "../../components/IngredientsCard/IngredientsCard";
import SearchInput from "../../components/SearchInput/SearchInput";
import { useAuth } from "../../hooks/useAuth";

const API_BASE = import.meta.env.VITE_API_URL;

export default function RecipeCreate() {
    const navigate = useNavigate();
    const { user, isGuest } = useAuth();

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [stepsText, setStepsText] = useState("");
    const [cookTime, setCookTime] = useState("");
    const [difficulty, setDifficulty] = useState("easy");
    const [categoryId, setCategoryId] = useState("");

    const [query, setQuery] = useState("");
    const [ingredientsResults, setIngredientsResults] = useState([]);
    const [selectedIngredients, setSelectedIngredients] = useState([]);
    const [categories, setCategories] = useState([]);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadCategories = async () => {
            try {
                const res = await fetch(`${API_BASE}/categories`);
                if (res.ok) {
                    const data = await res.json();
                    setCategories(data);
                }
            } catch (e) {
                console.error('Error al cargar categorías:', e);
            }
        };
        loadCategories();
    }, []);

    // Reutilizo el endpoint existente de ingredientes
    useEffect(() => {
        let cancelled = false;
        const controller = new AbortController();
        const load = async () => {
            if (!query) {
                setIngredientsResults([]);
                return;
            }
            try {
                const res = await fetch(`${API_BASE}/ingredients?q=${encodeURIComponent(query)}&limit=20`, { signal: controller.signal });
                if (!res.ok) throw new Error("Error al buscar ingredientes");
                const data = await res.json();
                if (!cancelled) setIngredientsResults(data.data || []);
            } catch (e) {
                if (!cancelled) console.error(e);
            }
        };
        load();
        return () => { cancelled = true; controller.abort(); };
    }, [query]);

    const addMyIngredient = (ing) => {
        if (!ing || !ing.id) return;
        setSelectedIngredients((prev) => prev.find(i => i.id === ing.id) ? prev : [...prev, ing]);
    };

    const removeMyIngredient = (id) => {
        setSelectedIngredients((prev) => prev.filter(i => i.id !== id));
    };

    const canSubmit = useMemo(() => (
        title.trim().length > 0 &&
        description.trim().length > 0 &&
        stepsText.trim().length > 0 &&
        selectedIngredients.length > 0 &&
        categoryId !== ""
    ), [title, description, stepsText, selectedIngredients, categoryId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!user || isGuest) {
            setError("Debes iniciar sesión para crear una receta.");
            return;
        }

        setLoading(true);
        try {
            if (description.trim() === '' || stepsText.trim() === '' || selectedIngredients.length === 0 || !categoryId) {
                throw new Error('Título, descripción, pasos, categoría e ingredientes son obligatorios');
            }

            const body = {
                user_id: user.id,
                title: title.trim(),
                description: description.trim(),
                steps: stepsText.trim(),
                cook_time: cookTime ? Number(cookTime) : null,
                difficulty: difficulty || 'easy',
                category_id: categoryId ? parseInt(categoryId) : null,
                ingredient_ids: selectedIngredients.map(i => i.id)
            };

            const res = await fetch(`${API_BASE}/recipes`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(body)
            });

            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.message || 'Error al crear receta');
            }

            const created = await res.json();
            navigate(`/recipe/${created.id}`);
        } catch (err) {
            setError(err.message || 'Error en el servidor');
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="recipe-create-page">
            <h1>Crear receta</h1>

            <form onSubmit={handleSubmit}>
                <label>
                    Título
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Nombre de la receta"
                        required
                    />
                </label>

                <label>
                    Descripción
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Breve descripción"
                        rows={3}
                    />
                </label>

                <label>
                    Instrucciones (un paso por línea)
                    <textarea
                        value={stepsText}
                        onChange={(e) => setStepsText(e.target.value)}
                        placeholder={'1) Preparar...\n2) Mezclar...'}
                        rows={6}
                    />
                </label>

                <div className="row-grid">
                    <label>
                        Tiempo de cocción (min)
                        <input type="number" min="0" value={cookTime} onChange={(e) => setCookTime(e.target.value)} />
                    </label>
                    <label>
                        Dificultad
                        <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
                            <option value="easy">Fácil</option>
                            <option value="medium">Medio</option>
                            <option value="hard">Difícil</option>
                        </select>
                    </label>
                    <label>
                        Categoría
                        <select 
                            value={categoryId} 
                            onChange={(e) => setCategoryId(e.target.value)}
                            required
                        >
                            {categories.map(cat => (
                                <option key={cat.id} value={cat.id}>
                                    {cat.category_name || cat.filter_name || `Categoría ${cat.id}`}
                                </option>
                            ))}
                        </select>
                    </label>
                </div>

                <section>
                    <h2>Ingredientes</h2>

                    <SearchInput value={query} onChange={setQuery} placeholder="Buscar ingredientes..." />

                    <ul className="ingredients-list">
                        {ingredientsResults.map((ing) => (
                            <IngredientsCard
                                key={ing.id}
                                id={ing.id}
                                name={ing.name}
                                selected={!!selectedIngredients.find((s) => s.id === ing.id)}
                                addMyIngredient={addMyIngredient}
                                removeMyIngredient={removeMyIngredient}
                                setRows={() => {}}
                            />
                        ))}
                    </ul>

                    {selectedIngredients.length > 0 && (
                        <div className="selected-ingredients">
                            <h3>Seleccionados</h3>
                            <ul>
                                {selectedIngredients.map((s) => (
                                    <li key={s.id} className="selected-item">
                                        <span>{s.name}</span>
                                        <Button variant="danger" size="small" onClick={() => removeMyIngredient(s.id)}>Quitar</Button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </section>

                {error && <p className="form-error">{error}</p>}

                <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                    <Button type="submit" variant="primary" size="large" className="btn--full-width" disabled={!canSubmit || loading}>
                        {loading ? 'Creando...' : 'Crear receta'}
                    </Button>

                    <Button
                        type="button"
                        variant="outline"
                        size="large"
                        onClick={() => {
                            setTitle("");
                            setDescription("");
                            setStepsText("");
                            setCookTime("");
                            setDifficulty("easy");
                            setQuery("");
                            setIngredientsResults([]);
                            setSelectedIngredients([]);
                            setError("");
                        }}
                    >
                        Limpiar
                    </Button>
                </div>
            </form>
        </main>
    );
}