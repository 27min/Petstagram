import React from 'react';

interface CustomButtonProps {
    onClick: () => void;
    disabled: boolean;
    variant: 'default' | 'outline';
    className?: string;
    children: React.ReactNode;
}

export const CustomButton: React.FC<CustomButtonProps> = ({ onClick, disabled, variant, className, children }) => {
    const baseStyles = "px-4 py-2 rounded-md font-medium transition-colors duration-200";
    const variants = {
        default: "bg-blue-500 text-white hover:bg-blue-600 disabled:bg-blue-300",
        outline: "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:bg-gray-100"
    };

    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`${baseStyles} ${variants[variant]} ${className || ''}`}
        >
            {children}
        </button>
    );
};

