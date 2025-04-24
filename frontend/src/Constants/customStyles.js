export const customStyles = {
    control: (styles) => ({
        ...styles,
        width: "100%",
        maxWidth: "16rem",
        minWidth: "12rem",
        borderRadius: "0.375rem",
        color: "#f3f4f6",
        fontSize: "0.875rem",
        lineHeight: "1.25rem",
        backgroundColor: "#1f2937", // bg-gray-800
        cursor: "pointer",
        border: "1px solid #374151", // border-gray-700
        boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
        ":hover": {
            borderColor: "#4b5563", // hover:border-gray-600
            boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
        },
        transition: "all 0.2s ease",
    }),
    option: (styles, { isFocused, isSelected }) => {
        return {
            ...styles,
            color: isSelected ? "#f9fafb" : "#f3f4f6",
            fontSize: "0.875rem",
            lineHeight: "1.25rem",
            width: "100%",
            background: isSelected
                ? "#3b82f6" // bg-blue-500 when selected
                : isFocused
                    ? "#374151" // bg-gray-700 when focused
                    : "#1f2937", // bg-gray-800
            ":hover": {
                backgroundColor: "#374151", // hover:bg-gray-700
                color: "#f9fafb",
                cursor: "pointer",
            },
            transition: "all 0.1s ease",
        };
    },
    menu: (styles) => {
        return {
            ...styles,
            backgroundColor: "#1f2937", // bg-gray-800
            maxWidth: "16rem",
            border: "1px solid #374151", // border-gray-700
            borderRadius: "0.375rem",
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
            zIndex: 10,
        };
    },
    placeholder: (defaultStyles) => {
        return {
            ...defaultStyles,
            color: "#9ca3af", // text-gray-400
            fontSize: "0.875rem",
            lineHeight: "1.25rem",
        };
    },
    singleValue: (defaultStyles) => ({
        ...defaultStyles,
        color: "#f3f4f6", // text-gray-200
    }),
    input: (defaultStyles) => ({
        ...defaultStyles,
        color: "#f3f4f6", // text-gray-200
    }),
    dropdownIndicator: (defaultStyles) => ({
        ...defaultStyles,
        color: "#9ca3af", // text-gray-400
        ":hover": {
            color: "#f3f4f6", // hover:text-gray-200
        },
    }),
    indicatorSeparator: (defaultStyles) => ({
        ...defaultStyles,
        backgroundColor: "#374151", // bg-gray-700
    }),
};