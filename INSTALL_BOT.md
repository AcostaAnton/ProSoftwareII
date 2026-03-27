# 🚀 Guía de Instalación - Bot de Telegram PasaYa

## Resumen

Esta guía explica cómo instalar y configurar el bot de Telegram **PasaYa** que permite a los residentes agregar nuevas visitas desde Telegram usando sus credenciales de ProSoftware.

## 📋 Requisitos Previos

- Node.js 18+ instalado
- Acceso a Supabase con credenciales de administrador
- El token del bot de Telegram: `8765696885:AAHuiCYWsGFUuXnreJM31wQIH_gcJcxsEfU`

## 🔧 Pasos de Configuración

### 1. **Instalar Dependencias**

```bash
npm install
```

Esto instalará:
- `telegraf` - Framework del bot de Telegram
- `dotenv` - Manejo de variables de entorno
- Todas las dependencias existentes del proyecto

### 2. **Configurar Variables de Entorno**

Usa el archivo `bot/.env.local` (ya tiene los cambios aplicados).

Verifica que tenga tus credenciales:

```env
# Bot de Telegram (ya proporcionado)
BOT_TOKEN=8765696885:AAHuiCYWsGFUuXnreJM31wQIH_gcJcxsEfU
BOT_NAME=PasaYa

# Supabase - Obtén estos valores del panel de Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Ambiente
NODE_ENV=development
```

**Para obtener las credenciales de Supabase:**
1. Ve a [Supabase Dashboard](https://app.supabase.com)
2. Selecciona tu proyecto
3. Ve a **Settings** → **API**
4. Copia:
   - `Project URL` → `SUPABASE_URL`
   - `service_role` key (debajo de anon key) → `SUPABASE_SERVICE_ROLE_KEY`

### 3. **Crear Tablas en Supabase**

1. Ve a tu proyecto en Supabase
2. Abre **SQL Editor**
3. Crea una nueva query
4. Copia y pega el contenido de `bot/migrations/001_create_bot_tables.sql`
5. Haz clic en "Run"

**Tabla que se creará:**
- `telegram_users` - Vincula cuentas de Telegram con usuarios de ProSoftware

**Nota:** La autenticación ahora se realiza mediante Supabase Auth (credenciales de email/contraseña), no a través de una tabla de PINs.

### 4. **Actualizar el Router (Opcional)**

Para agregar la página de configuración de Telegram a la aplicación web:

En `src/router/AppRouter.tsx`, agrega:

```tsx
import TelegramBotSettings from '../pages/settings/TelegramBotSettings'

// Dentro del router protegido:
{
  path: 'settings/telegram',
  element: <TelegramBotSettings />,
  // Solo residentes pueden acceder
  ...
}
```

## ▶️ Ejecutar el Bot

### Desarrollo (Modo Polling)

```bash
npm run bot:dev
```

El bot escuchará mensajes constantemente (consume más recursos pero es fácil para testing).

### Producción (Webhooks)

Para producción, necesitas un servidor HTTPS. Recomendamos:

1. Usar **Vercel** con funciones serverless
2. Usar **AWS Lambda** con API Gateway
3. Usar **Ngrok** para tunelización local

**Ejemplo con Ngrok (local testing):**

```bash
# En otra terminal
ngrok http 3001

# Actualizar webhook en Telegram
curl -X POST https://api.telegram.org/bot8765696885:AAHuiCYWsGFUuXnreJM31wQIH_gcJcxsEfU/setWebhook \
  -d url=https://xxxx-xxxxxxx-xxxx.ngrok.io/webhook \
  -d allowed_updates=message,callback_query
```

## 📱 Flujo de Usuario

### 1. **Autenticarse con Credenciales de ProSoftware**

El usuario inicia el bot en Telegram:
- Bot solicita: **Email** (del login de ProSoftware)
- Bot solicita: **Contraseña** (del login de ProSoftware)
- Las credenciales se validan contra Supabase Auth
- El rol del usuario se verifica (debe ser residente o admin)

### 2. **Iniciar el Bot en Telegram**

Buscar `@PasaYa_Bot` en Telegram o usar el enlace `https://t.me/PasaYa_Bot`

### 3. **Usar el Bot**

Una vez autenticado, el usuario puede:
- ➕ Crear nueva visita
- 📋 Ver historial de visitas

## 📊 Estructura del Proyecto

```
bot/
├── config.ts                    # Configuración central
├── server.ts                    # Servidor principal
├── services/
│   ├── supabase.ts             # Cliente Supabase
│   ├── pinAuth.service.ts      # Autenticación con Supabase Auth
│   └── visits.service.ts       # Operaciones de visitas
├── handlers/
│   ├── session.handler.ts      # Gestión de sesiones
│   ├── input.handler.ts        # Procesamiento de entrada (email/contraseña)
│   ├── confirm.handler.ts      # Confirmación de datos
│   └── menu.handler.ts         # Menús del bot
├── migrations/
│   └── 001_create_bot_tables.sql  # Migraciones (solo tabla telegram_users)
├── README.md                    # Documentación del bot
├── tsconfig.json               # Config TypeScript
└── .env.local                  # Variables configuradas
```

## 🐛 Troubleshooting

### Error: "SUPABASE_URL is not defined"

**Solución:** Verifica que tu archivo `.env` esté en `bot/.env` y tenga:
```env
SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
```

### Error: "Usuario de Telegram no encontrado"

**Solución:** La tabla `telegram_users` se crea automáticamente cuando el usuario se autentica.

### Error: "No tienes un PIN configurado"

**Solución:** Las credenciales se validan contra Supabase Auth automáticamente. Si hay problemas, verifica que tu usuario sea residente o admin en la tabla `profiles`.

### Error: "No tienes acceso"

**Solución:** Solo residentes y administradores pueden usar el bot. Verifica tu rol en la base de datos.

### Error: "Credenciales inválidas"

**Solución:** Verifica que el email y contraseña sean correctos - deben ser los mismos que usas para ingresar a ProSoftware.

### El bot no responde

**Solución:** 
1. Verifica que la API key de Telegram sea correcta
2. Revisa los logs: `npm run bot:dev` muestra errores
3. Usa Ngrok si estás en desarrollo local

## 🔒 Seguridad

- Las contraseñas se validan contra Supabase Auth (no se almacenan en el bot)
- Usa `SUPABASE_SERVICE_ROLE_KEY` solo en el servidor (nunca en frontend)
- El bot autentica a usuarios por Telegram ID y validación de credenciales
- Las sesiones del bot se limpian automáticamente

## 📈 Próximas Mejoras

- [ ] Interfaz gráfica para ver credenciales vinculadas
- [ ] Notificaciones cuando la visita es aprobada
- [ ] Descarga de QR directamente desde el bot
- [ ] Soporte para múltiples idiomas
- [ ] Caché para mejorar rendimiento
- [ ] Two-factor authentication (2FA) opcional

## 📞 Soporte

Para problemas o preguntas:
1. Revisa los logs: `npm run bot:dev`
2. Verifica la tabla `telegram_users` en Supabase
3. Comprueba que las credenciales de Supabase sean correctas
4. Consulta [USER_GUIDE_BOT.md](USER_GUIDE_BOT.md) para guía de usuario

---

**Última actualización:** Marzo 2026  
**Versión del Bot:** 1.0.0  
**Cambio Importante:** Ahora usa autenticación con email/contraseña de ProSoftware (Supabase Auth)
