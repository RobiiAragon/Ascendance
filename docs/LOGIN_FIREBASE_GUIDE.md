# ✅ Login desde Firebase - Guía Rápida

## Lo que hice

He mejorado la función de autenticación para que **se conecte directamente a Firebase** y busque los employees registrados.

### Cambios principales:

1. **`authenticateUser()`** - Ahora:
   - Intenta primero autenticar contra Firestore (Firebase)
   - Si no encuentra el employee, intenta USERS_DATABASE (fallback)
   - Muestra logs detallados en la consola

2. **`authenticateFromFirestore()`** - Completamente reescrita:
   - Usa `firebaseEmployeeManager.db` para acceder a Firestore
   - Busca el employee por email en la colección `employees`
   - Valida la contraseña
   - Retorna el objeto usuario con datos completos
   - Logs detallados para debugging

3. **`handleLogin()`** - Mejorada:
   - Logs más informativos
   - Mejor manejo de errores

---

## Cómo funciona

```
Usuario ingresa email/password
         ↓
handleLogin() captura datos
         ↓
authenticateUser() intenta autenticar
         ├─→ Primero: busca en Firestore
         │   ├─→ Busca employee por email
         │   ├─→ Valida contraseña
         │   └─→ Si existe y contraseña coincide → ✅ Login exitoso
         │
         └─→ Si no encuentra: intenta USERS_DATABASE (fallback)
             └─→ Si existe y contraseña coincide → ✅ Login exitoso
         
Si login exitoso:
├─→ Guardar sesión en sessionStorage
├─→ Mostrar "Login successful!"
└─→ Redirigir a index.html
```

---

## Cómo probar

### Prerequisito: Ya tienes un employee registrado en Firebase

1. **Abre la página de login**: `login.html`

2. **Abre la consola del navegador**: 
   - Presiona `F12` o `Ctrl+Shift+I`
   - Pestaña "Console"

3. **Ingresa credenciales del employee**:
   - Email: el email que usaste al crear el employee
   - Password: la contraseña que asignaste

4. **Verifica los logs en la consola**

### Logs esperados si login es exitoso:

```
==================================================
LOGIN ATTEMPT
==================================================
Email: tu@email.com
Remember Me: false
==================================================
🔐 Starting authentication process...
✓ firebaseEmployeeManager available
🔥 Authenticating from Firestore...
⏳ Initializing Firebase...
✅ Firebase initialized
🔍 Searching for employee with email: "tu@email.com" in collection: "employees"
✅ Found 1 document(s)
✅ Employee found: Tu Nombre (ID: doc-id-aqui)
   Email: tu@email.com
   Role: admin
   Store: VSU Miramar
✅ Password verified successfully
✅ User object created: {id: "...", email: "...", ...}
✅ Authentication successful from Firestore
🎉 Login successful!
User: {id: "...", name: "Tu Nombre", email: "tu@email.com", role: "admin", ...}
Session stored for user: tu@email.com
Login successful! Redirecting...
```

Luego se redirige a `index.html`

---

## Si algo no funciona

### ❌ "Employee not found with email: tu@email.com"

**Soluciones:**
1. Verifica que el email es correcto (sensible a mayúsculas)
2. Abre [Firebase Console](https://console.firebase.google.com)
3. Ve a Firestore → colección `employees`
4. Busca el documento del employee
5. Verifica que existe el campo `email` con el valor exacto

### ❌ "Password mismatch"

**Soluciones:**
1. Verifica que la contraseña es correcta (sensible a mayúsculas)
2. En Firebase Console, copia el valor exacto del campo `password`
3. Asegúrate de no tener espacios al principio o final

### ❌ "Firebase not initialized" o "Firestore database not available"

**Soluciones:**
1. Verifica que `config/abundance-config.js` tiene las credenciales correctas
2. Abre la consola y busca errores de Firebase
3. Si ves "Firebase SDK not loaded", verifica que los scripts están cargados en login.html

### ✅ Para verificar que todo está conectado

En la consola, ejecuta:
```javascript
// Ver si firebaseEmployeeManager está disponible
console.log(firebaseEmployeeManager);

// Ver si está inicializado
console.log(firebaseEmployeeManager.isInitialized);

// Ver la referencia a Firestore
console.log(firebaseEmployeeManager.db);

// Buscar un employee específico
firebaseEmployeeManager.db
  .collection('employees')
  .where('email', '==', 'tu@email.com')
  .get()
  .then(snapshot => {
    console.log('Encontrados:', snapshot.size, 'documentos');
    snapshot.forEach(doc => {
      console.log('Employee:', doc.data());
    });
  })
  .catch(error => console.error('Error:', error));
```

---

## Información guardada en la sesión

Después de login exitoso, se guarda en `sessionStorage`:

```javascript
{
  userId: "firestore_doc_id",
  email: "tu@email.com",
  name: "Tu Nombre",
  role: "admin",  // De employeeType (para permisos)
  store: "VSU Miramar",
  loginTime: "2025-12-10T...",
  rememberMe: false
}
```

Se usa para:
- Mostrar el nombre del usuario en el header
- Controlar permisos de acceso
- Filtrar menú según el rol
- Validar sesión

---

## Estructura del Employee en Firebase

Para que el login funcione, el employee en Firestore debe tener:

```json
{
  "name": "Tu Nombre",
  "email": "tu@email.com",
  "password": "tu_contraseña",
  "phone": "(619) 555-0000",
  "role": "Tu Puesto",
  "employeeType": "admin|manager|employee",
  "store": "VSU Miramar|VSU Morena|...",
  "status": "active",
  "hireDate": "2025-12-10",
  "emergencyContact": "...",
  "allergies": "...",
  "createdAt": {...},
  "updatedAt": {...}
}
```

---

## Debug: Ver todos los employees en Firestore

En la consola:
```javascript
firebaseEmployeeManager.db
  .collection('employees')
  .get()
  .then(snapshot => {
    console.log('Total de employees:', snapshot.size);
    snapshot.forEach(doc => {
      console.log(`- ${doc.data().name} (${doc.data().email})`);
    });
  });
```

---

## Notas de Seguridad

⚠️ Las contraseñas se guardan en texto plano. En producción:
1. Usar Firebase Authentication (mejor opción)
2. O usar bcrypt/hash para encriptar contraseñas
3. Usar HTTPS/TLS en todas las comunicaciones
4. Implementar rate limiting para intentos fallidos

✅ Por ahora funciona perfectamente para desarrollo y testing
