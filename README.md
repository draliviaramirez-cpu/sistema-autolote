# Sistema de Gestion para un Autolote

Proyecto academico para Desarrollo de Aplicaciones Web I.

## Tecnologias

- Backend: Node.js y Express.js
- Base de datos: MySQL
- Autenticacion: JWT
- Frontend: Angular
- API externa: Frankfurter para tasas de cambio
- Control de versiones: Gitflow

## Funcionalidades

- Registro e inicio de sesion de usuarios.
- CRUD de clientes.
- CRUD de vehiculos con filtros e imagen por URL.
- Registro y consulta de ventas.
- Conversión de precios desde USD a otras monedas.
- API protegida con JWT en las operaciones de administracion.

## Requisitos

- Node.js 20 o superior.
- npm.
- MySQL 8.

## Instalacion

1. Instalar las dependencias del backend:

   ```powershell
   npm install
   ```

2. Instalar las dependencias del frontend:

   ```powershell
   cd frontend
   npm install
   cd ..
   ```

3. Copiar `.env.example` como `.env` y completar la contraseña de MySQL y `JWT_SECRET`.

4. Crear las tablas en una base limpia:

   ```powershell
   & "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -p < docs\schema.sql
   ```

   `docs\schema.sql` es el unico esquema oficial del proyecto. Crea la base
   `autolote_db` con las tablas `usuario`, `cliente`, `vehiculo`, `consulta` y
   `venta`, que son las tablas utilizadas por el backend.

   No se deben crear las tablas antiguas con nombres plurales (`Usuarios`,
   `Clientes`, `Vehiculos`, `Consultas` y `Ventas`). Si ya existen en una base
   local, respalda los datos y eliminalas antes de ejecutar el esquema oficial.

   Si la base ya existe y solo falta la tabla de ventas:

   ```powershell
   & "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -p < docs\migrate-ventas.sql
   ```

   Para una base anterior que tampoco tiene consultas:

   ```powershell
   & "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -p < docs\migrate-consultas.sql
   ```

## Ejecucion

En una terminal iniciar el backend:

```powershell
npm start
```

En otra terminal iniciar Angular:

```powershell
cd frontend
npm start -- --host 127.0.0.1
```

Abrir `http://127.0.0.1:4200/login`.

El backend queda disponible en `http://localhost:3000`.

## Usuario de prueba local

Registrar un usuario administrador mediante el endpoint de registro y usar sus credenciales en el login. El registro publico crea usuarios con rol vendedor; la asignacion de administrador debe hacerse de forma controlada en la base de datos.

## API externa

La conversion usa Frankfurter:

- `https://api.frankfurter.dev/v1/latest?base=USD&symbols=EUR`
- Endpoint interno: `GET /api/tasas-cambio/convertir?monto=100&moneda=EUR`

## Gitflow

- `main`: version estable entregable.
- `develop`: integracion del equipo.
- `feature/*`: trabajo individual por funcionalidad.
- `release/*`: preparacion y pruebas de una entrega.

Cada funcionalidad debe entrar a `develop` mediante Pull Request despues de revisar codigo, ejecutar la compilacion y probar sus endpoints. No se deben subir `.env`, `node_modules` ni `dist`.

## Verificacion antes de integrar

```powershell
node --check src/app.js
node --check src/routes/venta.routes.js
node --check src/routes/tasas.routes.js
cd frontend
npm run build
```

Antes de fusionar a `develop` deben probarse login, clientes, vehiculos, ventas y conversion de monedas.
