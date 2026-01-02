import type { Config } from "tailwindcss";

const config: Config = {
    darkMode: "class",
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: "#f9f506",
                "background-light": "#f8f8f5",
                "background-dark": "#23220f",
                "neutral-dark": "#1c1c0d",
                "neutral-gray": "#9e9d47",
            },
            fontFamily: {
                display: ["Spline Sans", "sans-serif"],
                body: ["Noto Sans", "sans-serif"],
            },
            borderRadius: {
                lg: "1.5rem",
                xl: "2rem",
                "2xl": "3rem",
            },
            backgroundImage: {
                "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
                "gradient-conic":
                    "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
            },
        },
    },
    plugins: [
        require('@tailwindcss/typography'),
    ],
};
export default config;
