# Deploy a Cloudflare Pages

## Pasos para el primer deploy

### 1. Preparar el repositorio

Asegúrate de que tu código esté en un repositorio Git (GitHub, GitLab, o Bitbucket):

```bash
git init
git add .
git commit -m "Initial commit - Frontend base"
git branch -M main
git remote add origin <tu-repositorio-url>
git push -u origin main
```

### 2. Crear proyecto en Cloudflare Pages

1. Ve a [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Navega a **Workers & Pages** > **Create application** > **Pages**
3. Selecciona **Connect to Git**
4. Autoriza Cloudflare a acceder a tu repositorio
5. Selecciona el repositorio `congress-networking-app`

### 3. Configurar el build

En la configuración del proyecto, establece:

- **Framework preset**: Vite
- **Build command**: `npm run build`
- **Build output directory**: `dist`
- **Root directory**: `/congress-networking-app` (si el proyecto está en una subcarpeta)

### 4. Variables de entorno

Agrega las siguientes variables de entorno en la configuración:

```
VITE_API_URL=https://tu-worker-api.workers.dev
```

(Esto se configurará después de crear el backend en la Fase 2)

### 5. Deploy

1. Haz clic en **Save and Deploy**
2. Cloudflare Pages construirá y desplegará tu aplicación automáticamente
3. Una vez completado, recibirás una URL como: `https://congress-networking-app.pages.dev`

### 6. Configurar dominio personalizado (Opcional)

1. En la configuración del proyecto, ve a **Custom domains**
2. Agrega tu dominio personalizado
3. Sigue las instrucciones para configurar los registros DNS

## Deploys automáticos

Cloudflare Pages está configurado para hacer deploy automático:

- **Production**: Cada push a la rama `main`
- **Preview**: Cada push a otras ramas o pull requests

## Verificar el deploy

Una vez desplegado, verifica que:

- ✅ La landing page se carga correctamente
- ✅ Los estilos de Tailwind se aplican
- ✅ La navegación funciona
- ✅ Los botones responden correctamente

## Troubleshooting

### Build falla

Si el build falla, verifica:

1. Que `package.json` tenga todos los scripts necesarios
2. Que las dependencias estén correctamente instaladas
3. Revisa los logs de build en Cloudflare Pages

### Estilos no se cargan

Si los estilos no se cargan:

1. Verifica que `postcss.config.js` esté en la raíz del proyecto
2. Asegúrate de que `@tailwindcss/postcss` esté instalado
3. Revisa que `index.css` tenga el import correcto de Tailwind

### Rutas 404

Si las rutas no funcionan:

1. Cloudflare Pages maneja automáticamente el SPA routing
2. Si tienes problemas, agrega un archivo `_redirects` en la carpeta `public`:

```
/* /index.html 200
```

## Próximos pasos

Una vez que el frontend esté desplegado:

1. ✅ Fase 1 completada
2. ⏭️ Continuar con Fase 2: Backend con Cloudflare Workers
3. 🔗 Conectar el frontend con el backend mediante la variable `VITE_API_URL`
