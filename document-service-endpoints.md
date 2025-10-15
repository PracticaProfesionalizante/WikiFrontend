# 📄 Document Service - Endpoints Corregidos

## 🔗 Endpoints del Backend

Los siguientes endpoints están implementados en el `documentService.js` y coinciden con la documentación del backend:

### **GET** `/documents`
- **Descripción**: Obtener listado de documentos
- **Parámetros**: `page`, `size`, `sort`, `type`, `folder`, `search`
- **Respuesta**: Array de documentos
- **Método**: `documentService.getDocuments(params)`

### **GET** `/documents/{id}`
- **Descripción**: Obtener un documento por ID
- **Parámetros**: `id` (string|number)
- **Respuesta**: Objeto documento
- **Método**: `documentService.getDocumentById(id)`

### **POST** `/documents`
- **Descripción**: Crear un nuevo documento de URL o TEXT
- **Body**: Objeto con datos del documento
- **Respuesta**: Documento creado
- **Método**: `documentService.createDocument(documentData)`

### **PUT** `/documents/{id}`
- **Descripción**: Actualizar un documento existente
- **Parámetros**: `id` (string|number)
- **Body**: Objeto con datos actualizados
- **Respuesta**: Documento actualizado
- **Método**: `documentService.updateDocument(id, documentData)`

### **DELETE** `/documents/{id}`
- **Descripción**: Eliminar un documento
- **Parámetros**: `id` (string|number)
- **Respuesta**: Sin contenido (204)
- **Método**: `documentService.deleteDocument(id)`

## 🔧 Métodos Adicionales

### **GET** `/documents?type={type}`
- **Descripción**: Obtener documentos por tipo
- **Método**: `documentService.getDocumentsByType(type, params)`

### **GET** `/documents?folder={folder}`
- **Descripción**: Obtener documentos por carpeta
- **Método**: `documentService.getDocumentsByFolder(folder, params)`

### **GET** `/documents?search={term}`
- **Descripción**: Buscar documentos por nombre o contenido
- **Método**: `documentService.searchDocuments(searchTerm, params)`

## 📊 Estructura de Datos

### Documento (Request/Response)
```javascript
{
  id: number,
  name: string,           // Nombre del documento
  type: string,           // 'TEXT' | 'URL' | 'PDF'
  folder: string,         // Carpeta de organización
  content: string,        // Contenido del documento
  status: string,         // 'Publicado' | 'Borrador' | 'Archivado'
  author: string,         // Autor del documento
  createdAt: string,      // ISO 8601 timestamp
  updatedAt: string       // ISO 8601 timestamp
}
```

## 🛡️ Manejo de Errores

### Error 500 (Servidor no disponible)
- **Comportamiento**: Usa datos de prueba automáticamente
- **Log**: `🔄 [DOCUMENT SERVICE] Backend no disponible, usando datos de prueba`

### Error 404 (Endpoint no encontrado)
- **Comportamiento**: Usa datos de prueba automáticamente
- **Log**: `🔄 [DOCUMENT SERVICE] Backend no disponible, usando datos de prueba`

### Otros Errores
- **Comportamiento**: Propaga el error al componente
- **Log**: `❌ [DOCUMENT SERVICE] Error obteniendo documentos:`

## 🧪 Datos de Prueba

Cuando el backend no está disponible, se cargan automáticamente 6 documentos de prueba:

1. **Reglamento de Estudiantes** (TEXT - reglamentos)
2. **Manual de Usuario** (TEXT - manuales)
3. **Guía de Programación** (URL - guias)
4. **Documento de Configuración** (TEXT - configuracion)
5. **Presentación Institucional** (PDF - presentaciones)
6. **Política de Seguridad** (TEXT - politicas)

## 🚀 Uso en Componentes

```javascript
import documentService from '@/services/documentService'

// Obtener todos los documentos
const documents = await documentService.getDocuments()

// Crear un nuevo documento
const newDocument = await documentService.createDocument({
  name: 'Mi Documento',
  type: 'TEXT',
  folder: 'mi-carpeta',
  content: '# Contenido del documento',
  status: 'Borrador',
  author: 'Usuario Actual'
})

// Actualizar un documento
const updatedDocument = await documentService.updateDocument(1, {
  name: 'Documento Actualizado',
  status: 'Publicado'
})

// Eliminar un documento
await documentService.deleteDocument(1)
```

## ✅ Estado Actual

- ✅ **Endpoints corregidos** a `/documents`
- ✅ **Manejo de errores** implementado
- ✅ **Datos de prueba** disponibles
- ✅ **Logging detallado** para debugging
- ✅ **Integración completa** con AdminContentView
