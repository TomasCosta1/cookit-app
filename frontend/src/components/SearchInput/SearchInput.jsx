import React from 'react';
import './SearchInput.css';

const SearchInput = ({ 
    value, 
    onChange, 
    placeholder = "Buscar...", 
    onPageReset 
}) => {
    const handleChange = (e) => {
        const newValue = e.target.value;
        onChange(newValue);
        
        if (onPageReset) {
            onPageReset();
        }
    };

    return (
        <div className="search-input">
            <input
                type="text"
                placeholder={placeholder}
                value={value}
                onChange={handleChange}
            />
        </div>
    );
};

export default SearchInput;