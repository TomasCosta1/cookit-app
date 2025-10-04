import React from 'react';
import './Button.css';

const Button = ({ 
    children, 
    variant = 'primary', 
    size = 'medium',
    disabled = false,
    onClick,
    type = 'button',
    className = '',
    ...props 
}) => {
    const baseClass = 'btn';
    const variantClass = `btn--${variant}`;
    const sizeClass = `btn--${size}`;
    const disabledClass = disabled ? 'btn--disabled' : '';
    
    const classes = [
        baseClass,
        variantClass,
        sizeClass,
        disabledClass,
        className
    ].filter(Boolean).join(' ');

    return (
        <button
            type={type}
            className={classes}
            disabled={disabled}
            onClick={onClick}
            {...props}
        >
            {children}
        </button>
    );
};

export default Button;