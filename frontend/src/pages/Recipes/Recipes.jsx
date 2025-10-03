import { useState } from "react";

export default function Recipes() {
    const [q, setQ] = useState("");
    return (
        <>
            <div className="ingredients-input">
                <input
                    placeholder="Buscar..."
                    value={q}
                    onChange={(e) => {
                        setQ(e.target.value);
                    }}
                />
            </div>
        </>
    );
}
