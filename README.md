# WikiFrontend – guía para personas que recién empiezan

Bienvenido/a 👋. Este repositorio contiene el frontend de la Wiki institucional. Está construido con **Vue 3**, **Vite** y **Tailwind CSS**. Esta guía está pensada para programadores/as junior o personas que se suman al proyecto por primera vez. Sigue los pasos con calma: todo está pensado para que puedas avanzar sin conocer demasiadas cosas de antemano.

---

## 📌 Tabla de contenidos

1. [Antes de empezar](#antes-de-empezar)
2. [Primeros pasos rápidos](#primeros-pasos-rápidos)
3. [¿Cómo ejecuto el proyecto?](#cómo-ejecuto-el-proyecto)
4. [¿Dónde está cada cosa?](#dónde-está-cada-cosa)
5. **¿Prefieres GUI para Git? Usa SourceTree**
    - Descarga: [https://www.sourcetreeapp.com/](https://www.sourcetreeapp.com/)
    - Abre SourceTree y elige “Clone” → pega la URL del repositorio → selecciona carpeta destino.
    - Los comandos `git checkout`, `commit`, `pull` y `push` se realizan con botones. Asegúrate de escribir mensajes claros y revisar los archivos staged antes de confirmar.
    - Si tu rama aún no existe, crea una nueva desde “Branch”. Usa el mismo nombre que usarías en terminal.
6. [Flujo de trabajo recomendado](#flujo-de-trabajo-recomendado)
7. [Modificar componentes y vistas](#modificar-componentes-y-vistas)
8. [Estilos con Tailwind](#estilos-con-tailwind)
9. [Uso de servicios y APIs](#uso-de-servicios-y-apis)
10. [Scripts útiles](#scripts-útiles)
11. [Preguntas frecuentes y problemas comunes](#preguntas-frecuentes-y-problemas-comunes)
12. [Glosario](#glosario)
13. [Recursos extra](#recursos-extra)

---

## Antes de empezar

Asegúrate de tener instalado lo siguiente:

| Herramienta | ¿Cómo verificar? | Nota |
|-------------|------------------|------|
| Node.js 20.19 o mayor | `node --version` | Descarga desde [nodejs.org](https://nodejs.org) |
| npm (viene con Node) | `npm --version` | Deberías ver 9.x o superior |
| Git | `git --version` | Descarga desde [git-scm.com](https://git-scm.com/) |
| Editor recomendado | VS Code | Instala extensiones “Volar” (Vue), “Tailwind CSS IntelliSense” y “ESLint” |

---

## Primeros pasos rápidos

1. Clona el repositorio y entra a la carpeta:
   ```bash
   git clone <URL_DEL_REPOSITORIO>
   cd WikiFrontend
   ```
2. Instala las dependencias del proyecto:
   ```bash
   npm install
   ```
3. Levanta el servidor de desarrollo:
   ```bash
   npm run dev
   ```
4. Abre tu navegador y visita `http://localhost:5173`. Cada vez que guardes un archivo, la página se actualizará sola.

---

## ¿Cómo ejecuto el proyecto?

| Acción | Comando | ¿Para qué sirve? |
|--------|---------|------------------|
| Desarrollo | `npm run dev` | Levanta la app con recarga automática |
| Build (producción) | `npm run build` | Genera archivos listos para subir a un servidor |
| Previsualizar build | `npm run preview` | Prueba la versión compilada |
| Revisar errores de lint | `npm run lint` | Busca problemas de estilo/código |
| Formatear archivos | `npm run format` | Aplica Prettier automáticamente |

> Consejo: ejecuta `npm run lint` antes de subir tus cambios. Te ahorra revisiones posteriores.

---

## ¿Dónde está cada cosa?

```
src/
├── assets/          # Imágenes, fuentes, íconos
├── components/      # Componentes reutilizables (botones, formularios, modales…)
│   ├── common/      # Elementos compartidos (sidebar, header, icon selector, etc.)
│   ├── forms/       # Formularios complejos (ContentForm.vue, etc.)
│   ├── menu/        # Arboles de menús y utilidades relacionadas
│   └── modals/      # Modales específicos (crear usuario, eliminar, etc.)
├── core/            # Configuración central: router, plugins, directivas
├── middleware/      # Lógica que corre antes de cargar ciertas vistas (ej: auth)
├── services/        # Conexión con el backend (Axios)
├── stores/          # Estados globales (Pinia)
├── styles/          # Tailwind y estilos globales
├── utils/           # Funciones auxiliares (helpers)
└── views/           # Páginas completas (Dashboard, Administración, etc.)
```

Si vienes de otro proyecto, fíjate que aquí todo está pensado para ser **responsive** y se usa **Tailwind** como sistema de estilos principal.

---

## Flujo de trabajo recomendado

1. **Crea una rama nueva** con un nombre descriptivo:
   ```bash
   git checkout -b feature/nombre-claro
   ```
2. Haz los cambios necesarios. Guarda seguido.
3. Verifica que no haya errores:
   ```bash
   npm run lint
   ```
4. Prueba la app (`npm run dev`). Navega a la pantalla que tocaste y revisa en desktop + móvil.
5. Commitea con un mensaje corto y claro (ej: `feat: permitir filtrar documentos por tipo`).
6. Crea tu Pull Request y pide revisión.

---

## Modificar componentes y vistas

### Componentes

* Se guardan en `src/components/`.
* Usa el patrón `<script setup>` (ya lo verás en los archivos existentes).
* Importa componentes hijos con rutas absolutas (alias `@`):
  ```vue
  import SidebarMenu from '@/components/common/SidebarMenu.vue'
  ```

### Vistas

* Las pantallas completas están en `src/views/`.
* Los layouts (sidebar + header) se manejan desde cada vista principal (`DashboardView.vue`, `AdminContentView.vue`, etc.).
* Si agregas una vista nueva, recuerda registrarla en `src/core/router/index.js`.

### Formularios complejos

* `ContentForm.vue` (en `src/components/forms/`) sirve para crear o editar documentos. Contiene un “wizard” de pasos.
* Si editas un documento PDF, ahora verás un botón “Ver PDF” que abre el archivo en otra pestaña sin recargar la app.
* La vista `AdminContentView.vue` usa este formulario y maneja filtros (por tipo, estado, autor) y la vista previa de PDFs con `VuePdfEmbed`.

---

## Estilos con Tailwind

### Tailwind en pocas palabras

- **Tailwind** funciona con utilidades como `bg-blue-600` o `p-4`. No escribimos CSS clásico salvo casos puntuales.
- Los estilos globales se definen en `src/styles/tailwind.css`. Allí encontrarás las directivas principales:
  ```css
  @tailwind base;
  @tailwind components;
  @tailwind utilities;
  ```
- Tailwind lee todas las clases usadas en `src/**/*` y genera sólo las necesarias. Si inventas una clase a mano, Tailwind **no** la va a reconocer. Usa las utilidades existentes o extiende la configuración.

### Agregar estilos reutilizables con @apply

Si necesitas una combinación de clases que reutilizarás muchas veces, crea una clase usando `@apply` dentro de `tailwind.css` o en un archivo `.css` importado después de las directivas Tailwind.

```css
/* src/styles/tailwind.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

.btn-primary {
  @apply inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow transition hover:-translate-y-0.5 hover:bg-blue-700;
}
```

Luego, úsala en un componente:

```vue
<button class="btn-primary">Guardar</button>
```

### Extender Tailwind (colores, fuentes, animaciones…)

Si necesitas nuevos colores, tamaños o animaciones, agrégalos en `tailwind.config.cjs`, dentro de `theme.extend`.

```js
// tailwind.config.cjs
module.exports = {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          light: '#60a5fa',
          DEFAULT: '#2563eb',
          dark: '#1e3a8a'
        }
      },
      boxShadow: {
        glow: '0 10px 40px rgba(37, 99, 235, 0.3)'
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out forwards'
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: 0, transform: 'translateY(10px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' }
        }
      }
    }
  },
  plugins: []
}
```

Después de modificar la configuración, **reinicia `npm run dev`** para que Tailwind regenere las clases.

### Variantes (dark mode, hover, responsive)

- `hover:bg-blue-700` → aplica sólo al pasar el mouse.
- `sm:text-base` → aplica cuando el ancho es ≥ 640px.
- `dark:bg-slate-900` → aplica cuando el documento tiene la clase `dark`.

Ejemplo completo:

```vue
<div class="p-4 sm:p-8 bg-white dark:bg-slate-900 rounded-3xl shadow hover:shadow-lg transition">
  <h2 class="text-lg font-semibold text-slate-900 dark:text-slate-100">Título</h2>
  <p class="mt-2 text-sm text-slate-600 dark:text-slate-300">
    Contenido del bloque
  </p>
</div>
```

### ¿Y si realmente necesito CSS clásico?

Puedes crear un archivo `.css` nuevo (por ejemplo, `src/styles/custom.css`) e importarlo en `main.js`. Ahí puedes mezclar utilidades con reglas personalizadas.

```css
/* src/styles/custom.css */
.card-shadow {
  box-shadow: 0 15px 30px rgba(15, 23, 42, 0.15);
}
```

```js
// src/main.js
import './styles/tailwind.css'
import './styles/custom.css'
```

> Usa esta opción sólo cuando Tailwind no cubra un caso específico. Mantén las clases lo más simples posible para que el equipo pueda entenderlas rápido.

---

## Uso de servicios y APIs

Los servicios están en `src/services/` y usan Axios. Ejemplos:

* `documentService.js` – CRUD de documentos, descarga de PDFs, etc.
* `userService.js` – Usuarios y roles.
* `auth.js` – Login, refresh de tokens.

### ¿Dónde configuro la URL del backend?

En `src/services/api.js`:

```js
const api = axios.create({
  baseURL: 'http://practicas.teclab.edu.ar:8080'
})
```

> Si trabajas en otro entorno, cambia `baseURL` por la URL de tu backend.

---

## Scripts útiles

| Comando | ¿Qué hace? |
|---------|------------|
| `npm run dev` | Levanta el proyecto en desarrollo |
| `npm run build` | Genera los archivos para producción |
| `npm run preview` | Sirve esos archivos para probarlos |
| `npm run lint` | Ejecuta ESLint + Oxlint |
| `npm run format` | Aplica Prettier a los archivos del proyecto |

---

## Preguntas frecuentes y problemas comunes

| Problema | Posible solución |
|----------|------------------|
| No se abre el PDF cuando lo edito | Revisá en la consola si se bloqueó la ventana emergente. Si es así, habilita pop-ups para `localhost`. También verifica que el backend tenga el archivo cargado. |
| El selector de iconos no muestra resultados | Revisa tu conexión a internet (carga íconos locales + de FontAwesome). Busca por nombres simples (“book”, “user”). |
| Tailwind no aplica estilos | Asegúrate de usar clases válidas. Si acabas de crear una clase nueva, reinicia `npm run dev`. |
| Me desconecta al navegar | El token puede haber expirado. Inicia sesión nuevamente. |
| `npm run lint` falla | Lee el mensaje en consola. Normalmente indica el archivo y la línea. Corrige y vuelve a ejecutar. |

### ¿Cómo reporto un bug?

1. Describe qué estabas haciendo y qué esperabas que suceda.
2. Adjunta capturas o logs si puedes.
3. Indica cómo reproducirlo (paso a paso).

---

## Glosario

* **Componente**: Bloque reutilizable de UI (botones, modales, formularios).
* **Vista**: Página completa que el usuario ve (ej: Gestión de Contenidos).
* **Pinia Store**: Lugar central donde guardamos estados que comparten varios componentes.
* **Modal**: Ventana flotante que aparece encima de la vista principal.
* **Tailwind**: Sistema de utilidades CSS escrito como clases (ej: `p-4`, `text-sm`).
* **Wizard**: Formulario dividido en pasos (ej: el formulario de documentos).

---

## Recursos extra

* [Documentación oficial de Vue 3](https://vuejs.org/guide/introduction.html)
* [Guía rápida de Vite](https://vitejs.dev/guide/)
* [Tailwind Playground (probar clases online)](https://play.tailwindcss.com/)
* [Pinia – state management](https://pinia.vuejs.org/introduction.html)
* [Axios](https://axios-http.com/docs/intro)
* [Vue Router](https://router.vuejs.org/guide/)

---

¿Algo no quedó claro? Escríbenos o abre un issue con tus dudas. ¡Estamos para ayudarte! 🙌

**Hecho con ❤️ usando Vue 3 + Tailwind CSS**
