# My Poke Calc

> A **mobile-friendly Pokémon Individual Value (IV) calculator** with cross-generation base stat support.

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-6-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white)
![License](https://img.shields.io/badge/License-Non--commercial-green)

> [!NOTE]
> 🚧 This project is currently under active development. Features and UI are subject to change.

---

## ✨ Features

- 📱 **Mobile-first design** — optimized for handheld use during gameplay
- 🔢 **IV calculation** across all nine mainline generations (Gen 1–9)
- 📊 **Accurate base stats** sourced from PokéAPI, curated per generation
- 🌍 **Multi-language Pokémon names** (localization support)
- 🧹 **Clean dataset** — regional forms, partner Pokémon, and cosmetic-only variants with identical stats are filtered out to reduce noise

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19 + TypeScript |
| Build Tool | Vite 6 |
| Styling | Tailwind CSS |
| Data | PokéAPI + `pokemon` npm package |
| Testing | Vitest |

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm

### Installation

```bash
git clone https://github.com/Peatle/my-poke-calc.git
cd my-poke-calc
npm install
```

### Development

```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

---

## 📦 Data Management

Pokémon stat data is fetched from [PokéAPI](https://pokeapi.co/) and stored locally as JSON files under `src/data/stats/`. The following npm scripts manage the full data pipeline:

| Command | Description |
|---|---|
| `npm run data:fetch-names` | Fetch Pokémon names in all supported languages |
| `npm run data:fetch-stats` | Fetch base stats for every generation |
| `npm run data:prune` | Clean the dataset (remove redundant forms, regional variants, etc.) |
| `npm run data:update` | Run all of the above in sequence |

> [!IMPORTANT]
> Always run `npm run data:update` after cloning if you want the latest data, or if you modify any fetch/prune scripts.

---

## 🧪 Testing

Data integrity is verified via automated tests:

```bash
npm test
```

Tests are located in `src/dataVerification.test.ts` and cover:

- Correct Pokémon count per generation
- Presence of expected entries
- Absence of excluded forms (e.g., Minior color variants, partner Pikachu/Eevee)
- Stat data completeness

---

## 📁 Project Structure

```
my-poke-calc/
├── public/                  # Static assets
├── scripts/                 # Data pipeline scripts (Node.js)
│   ├── fetchNames.js        # Fetch localized Pokémon names
│   ├── fetchStats.js        # Fetch per-generation base stats
│   └── pruneData.js         # Remove redundant data entries
├── src/
│   ├── data/
│   │   └── stats/           # Curated JSON stat files (gen1.json – gen9.json)
│   ├── locales/             # Localized Pokémon name data
│   ├── App.tsx
│   └── dataVerification.test.ts
├── package.json
└── vite.config.ts
```

---

## 🤝 Contributing

This is a personal non-commercial project shared freely for the Pokémon community. Feel free to open issues or pull requests for bug reports, data corrections, or feature suggestions!

---

## 📜 Credits

- Pokémon data sourced from [PokéAPI](https://pokeapi.co/)
- Pokémon name data via the [`pokemon`](https://www.npmjs.com/package/pokemon) npm package
- Pokémon and all related names are trademarks of Nintendo / Game Freak / The Pokémon Company

---

*Built with ❤️ for the Pokémon community.*
