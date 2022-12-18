/** @type {import('tailwindcss').Config} */
module.exports = {
    outputDir: "/build/css/",
    content: ["./src/**/*.{html,js}", "./index.html"],
    theme: {
        extend: {
            sortingBtn: {
                color: "indigo-100",
                fontWeight: "bold",
            },
        },
    },
    plugins: [],
};
