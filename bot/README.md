# 🤖 Bot de Telegram - PasaYa

Bot de Telegram que permite que los residentes registren visitas de forma rápida y segura usando autenticación por PIN.

## 🎯 Características

- ✅ **Autenticación por PIN**: Los usuarios se autentican con un PIN de 4 dígitos vinculado a su cuenta
- ✅ **Registro de Visitas**: Formulario guiado para registrar nuevas visitas
- ✅ **Historial de Visitas**: Ver las visitas registradas recientemente
- ✅ **Integración con Supabase**: Los datos se almacenan sincronizadamente con la plataforma
- ✅ **Interfaz Intuitiva**: Menús y botones para facilitar la navegación

## 📦 Instalación

### 1. Dependencias

El bot ya está añadido al `package.json`. Instala todas las dependencias:

```bash
npm install
```

### 2. Configuración de Variables de Entorno

Crea un archivo `.env` en la carpeta `bot/`:

```bash
# Bot de Telegram
BOT_TOKEN=8765696885:AAHuiCYWsGFUuXnreJM31wQIH_gcJcxsEfU
BOT_NAME=PasaYa

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Ambiente
NODE_ENV=development
```

**Nota:** Puedes obtener estas credenciales de:
- **Bot Token**: Ya disponible (8765696885:AAHuiCYWsGFUuXnreJM31wQIH_gcJcxsEfU)
- **Supabase**: Panel de control → Settings → API

###3. Crear Tablas en Supabase

1. Ve a Supabase Dashboard
2. Abre el SQL Editor
3. Copia y pega el contenido de `bot/migrations/001_create_bot_tables.sql`
4. Ejecuta la migración

O ejecuta el script:

```bash
npm run db:migrate
```

## 🚀 Uso

### Desarrollo Local

```bash
npm run bot:dev
```

El bot escuchará mensajes en modo polling (consulta el servidor de Telegram constantemente).

### Producción

Para producción, usa webhooks en lugar de polling:

```bash
npm run bot:prod
```

## 📱 Uso del Bot

### Flujo de Uso

1. **Iniciar el Bot**
   ```
   /start
   ```

2. **Autenticación**
   - El bot pedirá tu PIN de 4 dígitos
   - Ingresa el PIN que configuraste en ProSoftware

3. **Menú Principal**
   - ➕ Nueva Visita
   - 📋 Mis Visitas
   - ⚙️ Configuración
   - ❌ Salir

4. **Registrar Nueva Visita**
   - Selecciona "Nueva Visita"
   - Completa los datos:
     - Nombre del visitante
     - Teléfono (opcional)
     - Fecha de visita
     - Hora (opcional)
     - Propósito (opcional)
     - Destino (opcional)
   - Confirma la información

5. **Ver Historial**
   - Selecciona "Mis Visitas" para ver tus visitas recientes

## 🔐 Configuración de PIN

Antes de usar el bot, necesitas configurar tu PIN en la aplicación web:

1. Inicia sesión en ProSoftware
2. Ve a Configuración
3. Configura tu PIN de 4 dígitos
4. Guarda los cambios

El PIN será reutilizable para futuras autenticaciones en el bot.

## 📚 Estructura del Proyecto

```
bot/
├── config.ts                 # Configuración del bot
├── server.ts                 # Servidor principal del bot
├── services/
│   ├── supabase.ts          # Cliente de Supabase
│   ├── pinAuth.service.ts   # Servicios de autenticación por PIN
│   └── visits.service.ts    # Servicios de visitas
├── handlers/
│   ├── session.handler.ts   # Manejo de sesiones
│   ├── input.handler.ts     # Manejo de entrada del usuario
│   ├── confirm.handler.ts   # Confirmación de visitas
│   └── menu.handler.ts      # Menús del bot
├── migrations/
│   └── 001_create_bot_tables.sql  # Migraciones de BD
├── .env.local               # Variables de entorno configuradas
└── tsconfig.json            # Configuración de TypeScript
```

## 🐛 Debugging

### Logs

El bot registra todos los eventos importante. Para ver los logs detallados:

```bash
NODE_ENV=development npm run bot:dev
```

### Problemas Comunes

**"Usuario de Telegram no encontrado"**
- Asegúrate de que tu cuenta de Telegram esté vinculada
- Crea la tabla `telegram_users` en Supabase

**"No tienes un PIN configurado"**
- Configura un PIN en la aplicación web de ProSoftware
- Asegúrate de que esté guardado en la tabla `user_pins`

**"Error al crear la visita"**
- Verifica que la tabla `visits` tenga los campos requeridos
- Asegúrate de que tu usuario sea un residente válido

## 🔄 Actualizar el Bot

Si necesitas actualizar el código:

```bash
git pull
npm install
npm run build
npm run bot:prod
```

## 📞 Soporte

Para reportar problemas o sugerencias, contacta al equipo de desarrollo.

## 📄 Licencia

ProSoftware - Todos los derechos reservados
