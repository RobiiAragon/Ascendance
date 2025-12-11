# Employee Login System Setup

## Overview
El sistema de login ha sido adaptado para autenticar usuarios directamente desde los registros de employees almacenados en Firestore, en lugar de depender de una base de datos de usuarios separada.

## Cambios Realizados

### 1. Formulario de Agregar Employee
- Agregado campo **Password** (requerido)
- Agregado campo **Confirm Password** (requerido)
- Validaciones incluidas:
  - Las contraseñas deben coincidir
  - Mínimo 6 caracteres

### 2. Formulario de Editar Employee
- Agregado campo **Password** (opcional)
- Agregado campo **Confirm Password** (opcional)
- Si no se proporciona contraseña, se mantiene la actual

### 3. Firebase Integration
- Las contraseñas se guardan en el documento del employee en Firestore
- Campo `password` se incluye en cada documento de employee

### 4. Login System (login.html)
- **Nueva función `authenticateFromFirestore(email, password)`**
  - Busca el employee por email en Firestore
  - Valida la contraseña
  - Retorna el objeto usuario con los datos del employee
  
- **Función `authenticateUser(email, password)` mejorada**
  - Primero intenta autenticar contra Firestore
  - Fallback a USERS_DATABASE para compatibilidad hacia atrás
  - Maneja errores de manera segura

- **handleLogin ahora es asíncrona**
  - Soporta llamadas asincrónicas a Firebase

## Flujo de Autenticación

```
1. Usuario ingresa email y contraseña
2. handleLogin() valida campos
3. authenticateUser() se ejecuta:
   - Intenta buscar en Firestore
   - Si no existe, intenta USERS_DATABASE (fallback)
4. Si autenticación es exitosa:
   - Se crea objeto usuario con datos del employee
   - Se guarda sesión en sessionStorage
   - Se redirige a index.html
5. Si falla:
   - Se muestra error "Invalid email or password"
```

## Campos del Employee en Firestore

```javascript
{
  name: "John Doe",
  email: "john@vsu.com",
  password: "secure123",  // Nueva contraseña
  phone: "(619) 555-0000",
  role: "Store Manager",  // Job position
  employeeType: "manager",  // Permission level (admin/manager/employee)
  store: "VSU Miramar",
  status: "active",
  hireDate: "2023-01-15",
  emergencyContact: "...",
  allergies: "...",
  createdAt: ...,
  updatedAt: ...
}
```

## Objeto Usuario en Sesión

Al autenticar desde Firestore, el objeto usuario incluye:

```javascript
{
  id: "firestore_doc_id",
  firestoreId: "firestore_doc_id",
  email: "john@vsu.com",
  name: "John Doe",
  role: "manager",  // De employeeType (para permisos)
  jobRole: "Store Manager",  // De role (puesto de trabajo)
  store: "VSU Miramar",
  status: "active"
}
```

## Notas de Seguridad

⚠️ **IMPORTANTE**: En producción, no se deben guardar contraseñas en texto plano en Firestore. Se recomienda:

1. Usar **Firebase Authentication** en lugar de almacenar contraseñas
2. Si se deben guardar localmente, usar **bcrypt** u otro algoritmo de hash
3. Implementar HTTPS/TLS para todas las comunicaciones
4. Usar reglas de seguridad en Firestore para proteger los datos

## Testing

Para probar el nuevo sistema:

1. **Agregar un employee** con contraseña:
   - Ir a Employees > Add New Employee
   - Llenar todos los campos incluyendo password
   - Guardar

2. **Editar employee** (cambiar contraseña):
   - Hacer clic en Edit en un employee
   - Dejar password vacío para mantener el actual
   - O ingresar nueva contraseña (mínimo 6 caracteres)

3. **Probar login**:
   - Ir a login.html
   - Usar email y contraseña del employee creado
   - Verificar que se redirige a index.html con sesión activa

## Compatibilidad

- El sistema mantiene compatibilidad hacia atrás con USERS_DATABASE
- Los usuarios existentes en USERS_DATABASE aún pueden hacer login
- Se recomienda migrar todos los usuarios a la nueva estructura de employees
