import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        navy: "#0B1F4D",
        electric: "#007BFF",
        gold: "#F4B400",
        ink: "#08152F",
        mist: "#F6F8FC"
      },
      boxShadow: {
        premium: "0 24px 80px rgba(11, 31, 77, 0.14)",
        glow: "0 0 40px rgba(0, 123, 255, 0.28)"
      },
      fontFamily: {
        sans: ["Arial", "Helvetica", "sans-serif"]
      },
      backgroundImage: {
        "premium-radial":
          "radial-gradient(circle at top left, rgba(0,123,255,0.18), transparent 34%), radial-gradient(circle at 82% 20%, rgba(244,180,0,0.16), transparent 30%)"
      }
    }
  },
  plugins: []
};

export default config;
