# Testing Employee Login with Firebase

## Pasos para Probar el Login

### 1. Verificar que el Employee está en Firebase
Antes de intentar loguear, asegúrate de que el employee existe en Firestore:
- Abre [Firebase Console](https://console.firebase.google.com)
- Navega a tu proyecto
- Ve a Firestore Database
- Verifica la colección `employees`
- Busca el documento con el email del employee que creaste

El documento debe tener esta estructura:
```json
{
  "name": "Tu Nombre",
  "email": "tu@email.com",
  "password": "tu_contraseña",
  "phone": "(619) 555-0000",
  "role": "Tu Puesto",
  "employeeType": "admin|manager|employee",
  "store": "VSU Miramar|VSU Morena|VSU Kearny Mesa|VSU Chula Vista",
  "status": "active",
  "hireDate": "2025-12-10",
  ...
}
```

### 2. Abrir la Página de Login
1. Navega a `login.html`
2. Abre la consola del navegador (F12 o Ctrl+Shift+I)
3. Ve a la pestaña "Console"

### 3. Ingresar Credenciales
Ingresa el email y password del employee que registraste

### 4. Monitorear la Consola
Deberías ver mensajes como estos:

✅ **Si el login es exitoso:**
```
🔍 Searching for employee with email: tu@email.com in collection: employees
✅ Employee found: Tu Nombre
✅ Password matched
✅ User authenticated from Firestore: tu@email.com Role: admin
Session stored for user: tu@email.com
Login successful! Redirecting...
```

❌ **Si el email no existe:**
```
🔍 Searching for employee with email: tu@email.com in collection: employees
❌ Employee not found with email: tu@email.com
```

❌ **Si la contraseña es incorrecta:**
```
🔍 Searching for employee with email: tu@email.com in collection: employees
✅ Employee found: Tu Nombre
❌ Password mismatch for employee: tu@email.com
```

### 5. Esperado After Login
Si todo funciona:
1. Verás el mensaje "Login successful! Redirecting..."
2. Después de 1 segundo, se redirige a `index.html`
3. Verás un mensaje en la consola: "✅ User authenticated: tu@email.com - Role: [tu role]"

## Troubleshooting

### Error: "Firebase not loaded"
- Verifica que los scripts de Firebase están en login.html
- Asegúrate de que `config/env.js` y `config/abundance-config.js` están cargados

### Error: "Firebase not initialized"
- Revisa la consola para ver errores de inicialización
- Verifica que las credenciales de Firebase en `config/abundance-config.js` son correctas

### Error: "Firestore database not available"
- Verifica que Firebase está inicializado correctamente
- Revisa que `firebaseEmployeeManager` está disponible

### El employee no se encuentra
- Verifica el email exacto (sensible a mayúsculas/minúsculas)
- Abre Firebase Console y verifica que el documento existe
- Verifica que está en la colección correcta (por defecto: `employees`)

### La contraseña no coincide
- Verifica que la contraseña es exactamente igual (sensible a mayúsculas/minúsculas)
- Abre Firebase Console y copia la contraseña exacta del documento
- Asegúrate de no tener espacios en blanco al principio o final

## Debugging Adicional

### Ver la Respuesta de Firebase
En la consola, ejecuta:
```javascript
// Buscar un employee específico
const db = firebase.firestore();
db.collection('employees').where('email', '==', 'tu@email.com').get()
  .then(snapshot => {
    if (snapshot.empty) {
      console.log('No employee found');
      return;
    }
    snapshot.forEach(doc => {
      console.log('Employee data:', doc.data());
    });
  })
  .catch(error => console.error('Error:', error));
```

### Ver FirebaseEmployeeManager
```javascript
console.log('FirebaseEmployeeManager:', firebaseEmployeeManager);
console.log('Is Initialized:', firebaseEmployeeManager.isInitialized);
console.log('DB Available:', !!firebaseEmployeeManager.db);
```

## Notas

⚠️ **Seguridad:** Las contraseñas se guardan en texto plano en Firestore. En producción, se recomienda:
1. Usar Firebase Authentication en lugar de almacenar contraseñas
2. Usar bcrypt u otro algoritmo de hash
3. Usar HTTPS/TLS para todas las comunicaciones

✅ **El sistema es completamente funcional** y está diseñado para trabajar con los employees creados en el formulario de "Add Employee"
