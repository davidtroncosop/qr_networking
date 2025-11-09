# Congress Networking App - Frontend

Una Progressive Web App para networking en eventos y congresos.

## 🚀 Tecnologías

- React 18+ con TypeScript
- Vite como build tool
- TailwindCSS para estilos
- React Router para navegación

## 📦 Instalación

```bash
npm install
```

## 🛠️ Desarrollo

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

## 🏗️ Build

```bash
npm run build
```

Los archivos de producción se generarán en la carpeta `dist/`

## 🌐 Deploy a Cloudflare Pages

1. Conecta tu repositorio Git a Cloudflare Pages
2. Configura el build:
   - Build command: `npm run build`
   - Build output directory: `dist`
3. Agrega las variables de entorno necesarias (ver `.env.example`)

## 📁 Estructura del Proyecto

```
src/
├── components/     # Componentes reutilizables
├── pages/          # Páginas de la aplicación
├── hooks/          # Custom React hooks
├── utils/          # Utilidades y constantes
├── types/          # Definiciones de TypeScript
└── services/       # Servicios de API
```

## 🎨 Design System

El proyecto utiliza un design system basado en Tailwind con:
- Colores primarios: Azul (#2563eb)
- Colores secundarios: Púrpura (#7c3aed)
- Fuente: Inter
- Componentes base: Button, Input, Card, Modal

## 📝 Licencia

MIT
