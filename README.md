# WikiFrontend – guía para personas que recién empiezan

Bienvenido/a 👋. Este repositorio contiene el frontend de la Wiki institucional. Está construido con **Vue 3**, **Vite** y **Tailwind CSS**. Esta guía está pensada para programadores/as junior o personas que se suman al proyecto por primera vez. Sigue los pasos con calma: todo está pensado para que puedas avanzar sin conocer demasiadas cosas de antemano.

---

## 📌 Tabla de contenidos

1. [Antes de empezar](#antes-de-empezar)
2. [Primeros pasos rápidos](#primeros-pasos-rápidos)
3. [¿Cómo ejecuto el proyecto?](#cómo-ejecuto-el-proyecto)
4. [¿Dónde está cada cosa?](#dónde-está-cada-cosa)
5. [Flujo de trabajo recomendado](#flujo-de-trabajo-recomendado)
6. [Modificar componentes y vistas](#modificar-componentes-y-vistas)
7. [Estilos con Tailwind](#estilos-con-tailwind)
8. [Uso de servicios y APIs](#uso-de-servicios-y-apis)
9. [Scripts útiles](#scripts-útiles)
10. [Preguntas frecuentes y problemas comunes](#preguntas-frecuentes-y-problemas-comunes)
11. [Glosario](#glosario)
12. [Recursos extra](#recursos-extra)

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

* Usa utilidades Tailwind (`class="bg-slate-100 text-sm"`), no CSS tradicional salvo casos puntuales.
* Para estilos reutilizables, crea clases personalizadas en `tailwind.config.cjs` o componentes específicos.
* Recuerda siempre revisar versión móvil (`Ctrl+Shift+M` en Chrome/Edge) porque el diseño es mobile-first.

### Recursos rápidos de Tailwind

* [Cheat sheet oficial](https://tailwindcss.com/docs)
* Para colores, usa la escala `slate`, `blue`, `emerald`… Ejemplo: `text-slate-600`, `bg-blue-600`.
* Para dark mode, agrega `dark:` antes de la clase (ej: `dark:bg-slate-900`).

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
