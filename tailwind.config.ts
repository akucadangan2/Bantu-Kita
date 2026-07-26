import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Diambil dari logo Bantu Kita: navy (tangan kiri/"Bantu") + teal ("Kita") + coral (hati tengah)
        primary: {
          // navy — dipakai untuk teks "Bantu", tombol utama, elemen berat
          DEFAULT: "#14336B",
          dark: "#0C2350",
          light: "#E8ECF6",
        },
        secondary: {
          // teal — dipakai untuk teks "Kita", aksen sekunder, hover state
          DEFAULT: "#14B8A6",
          dark: "#0F8577",
          light: "#E3F7F3",
        },
        accent: {
          // coral — hanya untuk aksen kecil (badge urgent, ikon hati, highlight), jangan dominan
          DEFAULT: "#F2665C",
          light: "#FDEDEB",
        },
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.5rem",
      },
    },
  },
  plugins: [],
};

export default config;