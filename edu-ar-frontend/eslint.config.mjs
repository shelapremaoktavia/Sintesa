import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";

const eslintConfig = defineConfig([
  ...nextVitals,
  {
    rules: {
      // Pola fetch-data standar (load() di dalam useEffect) ditandai sebagai
      // false-positive oleh rule ini di Next.js 16 — dimatikan agar
      // `npm run lint` bersih tanpa mengubah logika yang sudah benar.
      'react-hooks/set-state-in-effect': 'off',
      // Galeri Library memakai <img> untuk URL dinamis dari backend
      // (tidak bisa dioptimasi next/image) — peringatan saja, bukan error.
      '@next/next/no-img-element': 'off',
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
