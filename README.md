# WikiFrontend

Frontend de aplicación Wiki desarrollado con Vue 3, Vite, Pinia y Vue Router.

## 📋 Tabla de Contenidos

- [Requisitos Previos](#requisitos-previos)
- [Instalación](#instalación)
- [Configuración](#configuración)
- [Ejecutar el Proyecto](#ejecutar-el-proyecto)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Tecnologías Utilizadas](#tecnologías-utilizadas)
- [Scripts Disponibles](#scripts-disponibles)
- [Configuración del Backend](#configuración-del-backend)
- [Guía de Desarrollo](#guía-de-desarrollo)
- [Autenticación y Roles](#autenticación-y-roles)
- [Contribuir](#contribuir)

## 🚀 Requisitos Previos

Antes de comenzar, asegúrate de tener instalado:

- **Node.js**: Versión `^20.19.0` o `>=22.12.0` ([Descargar Node.js](https://nodejs.org/))
- **npm**: Viene incluido con Node.js
- **Git**: Para clonar el repositorio ([Descargar Git](https://git-scm.com/))

### Verificar instalación

Abre una terminal y ejecuta:

```bash
node --version  # Debe mostrar v20.19.0 o superior
npm --version   # Debe mostrar 9.x.x o superior
git --version   # Debe mostrar 2.x.x o superior
```

## 📦 Instalación

1. **Clonar el repositorio**

```bash
git clone <URL_DEL_REPOSITORIO>
cd WikiFrontend
```

2. **Instalar dependencias**

```bash
npm install
```

Esto instalará todas las dependencias necesarias definidas en `package.json`.

## ⚙️ Configuración

### Variables de Entorno

El proyecto se conecta a un backend en `http://practicas.teclab.edu.ar:8080`. Si necesitas cambiar esta URL, modifica el archivo:

**Archivo:** `src/services/api.js`

```javascript
const api = axios.create({
  baseURL: 'http://practicas.teclab.edu.ar:8080',
  // ...
})
```

## 🏃 Ejecutar el Proyecto

### Modo Desarrollo

Inicia el servidor de desarrollo con recarga automática:

```bash
npm run dev
```

El proyecto estará disponible en: `http://localhost:5173`

### Modo Producción

Para crear una versión optimizada para producción:

```bash
npm run build
```

Los archivos compilados se generarán en la carpeta `dist/`.

Para previsualizar la versión de producción:

```bash
npm run preview
```

## 📁 Estructura del Proyecto

```
WikiFrontend/
├── public/                 # Archivos estáticos
├── src/
│   ├── assets/            # Imágenes, fuentes, etc.
│   ├── components/        # Componentes reutilizables
│   │   ├── ContentForm.vue
│   │   ├── CreateUserModal.vue
│   │   ├── DeleteUserModal.vue
│   │   ├── DeleteMenuModal.vue
│   │   ├── EditUserModal.vue
│   │   ├── IconSelector.vue
│   │   ├── MenuTreeNode.vue
│   │   ├── StatusChangeModal.vue
│   │   └── ...
│   ├── core/              # Configuración central
│   │   ├── router/        # Configuración de rutas
│   │   └── ...
│   ├── middleware/        # Middlewares de autenticación
│   ├── services/          # Servicios API
│   │   ├── api.js         # Configuración de Axios
│   │   ├── auth.js        # Servicio de autenticación
│   │   ├── userService.js # Servicio de usuarios
│   │   ├── menuService.js # Servicio de menús
│   │   └── documentService.js
│   ├── stores/            # Pinia stores
│   │   └── auth.js        # Store de autenticación
│   ├── styles/            # Estilos globales
│   ├── utils/             # Utilidades
│   ├── views/             # Páginas/Vistas
│   │   ├── AdminContentView.vue
│   │   ├── MenuManagerView.vue
│   │   ├── UserManagementView.vue
│   │   └── ...
│   ├── App.vue            # Componente raíz
│   └── main.js            # Punto de entrada
├── .editorconfig          # Configuración del editor
├── .eslintrc.js           # Configuración de ESLint
├── .gitignore            # Archivos ignorados por Git
├── .prettierrc.json      # Configuración de Prettier
├── index.html            # HTML principal
├── package.json          # Dependencias y scripts
├── vite.config.js        # Configuración de Vite
└── README.md            # Este archivo
```

## 🛠️ Tecnologías Utilizadas

### Core
- **Vue 3** (v3.5.18) - Framework JavaScript reactivo
- **Vite** - Build tool y dev server ultrarrápido
- **Vue Router** (v4.5.1) - Enrutador para SPAs
- **Pinia** (v3.0.3) - State management

### Estilos (Tailwind CSS)
- El proyecto usa **Tailwind CSS** como ÚNICO sistema de estilos.
- Importado en `src/main.js`: `import './styles/tailwind.css'`
- Configuración en `tailwind.config.cjs` y `postcss.config.cjs`.
- Se eliminó **Vuetify** y los estilos globales puros (`themes.css`).

### UI/UX
- **Font Awesome** - Iconos
- **Material Design Icons** - Iconos adicionales
- **Roboto Font** - Fuente principal

### Utilidades
- **Axios** - Cliente HTTP
- **Marked** & **Markdown-it** - Procesamiento de Markdown
- **Vue PDF Embed** - Visualizador de PDFs

### Desarrollo
- **ESLint** - Linter de código
- **Prettier** - Formateador de código
- **Oxlint** - Linter rápido

## 📜 Scripts Disponibles

```bash
# Desarrollo
npm run dev          # Inicia servidor de desarrollo en http://localhost:5173

# Producción
npm run build        # Compila el proyecto para producción
npm run preview      # Previsualiza la build de producción

# Calidad de Código
npm run lint         # Ejecuta ESLint y Oxlint
npm run format       # Formatea el código con Prettier
```

## 🔧 Configuración del Backend

El proyecto se conecta a un backend REST API. Asegúrate de que el backend esté ejecutándose en:

```
http://practicas.teclab.edu.ar:8080
```

### Endpoints Principales

#### Autenticación
- `POST /auth/login` - Iniciar sesión
- `POST /auth/register` - Crear usuario
- `POST /auth/refresh` - Renovar token

#### Usuarios
- `GET /users` - Listar usuarios
- `GET /users/me` - Obtener usuario actual
- `PUT /users/{id}` - Actualizar usuario
- `DELETE /users/{id}` - Eliminar usuario

#### Menús
- `GET /menu` - Listar menús
- `POST /menu` - Crear menú
- `PUT /menu/{id}` - Actualizar menú
- `DELETE /menu/{id}` - Eliminar menú

#### Documentos
- `GET /documents` - Listar documentos
- `POST /documents` - Crear documento
- `PUT /documents/{id}` - Actualizar documento
- `DELETE /documents/{id}` - Eliminar documento

## 💻 Guía de Desarrollo

### Crear un Nuevo Componente

1. Crea el archivo en `src/components/`:

```vue
<template>
  <div class="p-4 rounded-lg bg-white dark:bg-slate-800 shadow">
    <h1 class="text-lg font-semibold text-slate-800 dark:text-slate-100">{{ title }}</h1>
  </div>
</template>

<script setup>
import { ref } from 'vue'

defineProps({
  title: String
})
</script>
```

2. Importa y usa el componente:

```vue
<script setup>
import MyComponent from '@/components/MyComponent.vue'
</script>

<template>
  <MyComponent title="Mi Componente" />
</template>
```

### Crear una Nueva Vista

1. Crea el archivo en `src/views/`:

```vue
<template>
  <div class="min-h-screen p-6">
    <h1 class="text-2xl font-bold">Mi Vista</h1>
  </div>
</template>

<script setup>
import { ref } from 'vue'
</script>
```

2. Agrega la ruta en `src/core/router/index.js`:

```javascript
{
  path: '/mi-vista',
  name: 'MiVista',
  component: () => import('@/views/MiVista.vue'),
  meta: {
    title: 'Mi Vista',
    requiresAuth: true,
  }
}
```

### Crear un Nuevo Servicio

1. Crea el archivo en `src/services/`:

```javascript
import api from './api'

const miService = {
  async getData() {
    const response = await api.get('/mi-endpoint')
    return response.data
  },

  async postData(data) {
    const response = await api.post('/mi-endpoint', data)
    return response.data
  }
}

export default miService
```

2. Úsalo en tus componentes:

```javascript
import miService from '@/services/miService'

const data = await miService.getData()
```

### Gestión de Estado con Pinia

1. Crea un store en `src/stores/`:

```javascript
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useMyStore = defineStore('myStore', () => {
  const count = ref(0)

  function increment() {
    count.value++
  }

  return { count, increment }
})
```

2. Úsalo en tus componentes:

```javascript
import { useMyStore } from '@/stores/myStore'

const store = useMyStore()
store.increment()
console.log(store.count)
```

## 🔐 Autenticación y Roles

### Roles Disponibles

- `ROLE_SUPER_USER` - Super Usuario (acceso completo)
- `ROLE_ADMIN` - Administrador
- `ROLE_COLLABORATOR` - Colaborador
- `ROLE_USER` - Usuario básico

### Proteger Rutas

En `src/core/router/index.js`:

```javascript
{
  path: '/admin',
  meta: {
    roles: ['ROLE_SUPER_USER']
  }
}
```

### Verificar Roles en Componentes

```javascript
import { useAuthStore } from '@/stores/auth'
import { computed } from 'vue'

const authStore = useAuthStore()

const isAdmin = computed(() =>
  authStore.hasRole('ROLE_ADMIN')
)
```

## 🎨 Estilos y Temas

- Usa clases `dark:` de Tailwind. Se puede activar añadiendo `class="dark"` o `data-theme="dark"` en `<html>` o `<body>`.
- No hay archivos CSS globales personalizados: todo se maneja con utilidades de Tailwind.

## 🐛 Debugging

- Usa la consola para revisar logs de servicios (`console.log` / `console.error`).
- Instala Vue DevTools para inspeccionar el estado de componentes y stores.

## ✅ Verificación de Calidad

```bash
npm run lint     # Linter (ESLint + Oxlint)
npm run format   # Formateador (Prettier)
```

## 📝 Notas Importantes

### Convenciones de Nomenclatura
- Componentes: PascalCase (`UserManagement.vue`)
- Archivos JS: camelCase (`userService.js`)
- Vistas: PascalCase (`MenuManagerView.vue`)

### Importaciones

```javascript
// ✅ Correcto
import UserService from '@/services/userService'
import MyComponent from '@/components/MyComponent.vue'

// ❌ Incorrecto
import UserService from '../../services/userService'
```

### Estructura de Commits

```
feat: Agregar nueva funcionalidad
fix: Corregir bug
docs: Actualizar documentación
style: Cambios de formato
refactor: Refactorización de código
test: Agregar o modificar tests
chore: Cambios en configuración
```

## 🤝 Contribuir

1. Crea una rama desde `main`:
   ```bash
   git checkout -b feature/mi-nueva-funcionalidad
   ```
2. Realiza tus cambios
3. Verifica el código:
   ```bash
   npm run lint && npm run format
   ```
4. Crea tu Pull Request

## 📞 Soporte

- Revisa la documentación y los issues.
- Abre un issue con detalles si necesitas soporte.

## 📄 Licencia

Este proyecto es privado y de uso interno.

---

**Desarrollado con ❤️ usando Vue 3 + Tailwind CSS**
