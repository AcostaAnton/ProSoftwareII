# ✅ Checklist de Verificación - Bot PasaYa

## Pre-Instalación

### Requisitos del Sistema
- [ ] Node.js 18+ instalado
- [ ] npm/yarn disponible
- [ ] Acceso a terminal/CMD
- [ ] Conexión a internet

### Credenciales Disponibles
- [ ] Token del bot: `8765696885:AAHuiCYWsGFUuXnreJM31wQIH_gcJcxsEfU`
- [ ] URL de Supabase
- [ ] Service Role Key de Supabase
- [ ] Proyecto Supabase activo

---

## Instalación

### Dependencias
- [ ] Ejecuté `npm install`
- [ ] Sin errores en la instalación
- [ ] `telegraf` está en node_modules
- [ ] `dotenv` está en node_modules

### Configuración de Variables de Entorno
- [ ] Tengo archivo `bot/.env.local` con credenciales
- [ ] Verificué `BOT_TOKEN`
- [ ] Verificué `SUPABASE_URL`
- [ ] Verificué `SUPABASE_SERVICE_ROLE_KEY`
- [ ] Verificué `NODE_ENV=development`

### Base de Datos
- [ ] Creé tabla `telegram_users` en Supabase
- [ ] Tabla `telegram_users` tiene:
  - [ ] id (UUID)
  - [ ] telegram_id (VARCHAR)
  - [ ] telegram_username (VARCHAR)
  - [ ] user_id (FK)
  - [ ] linked_at (TIMESTAMP)

**Nota:** La tabla `user_pins` ya no es necesaria - la autenticación se realiza mediante Supabase Auth

---

## Configuración de la App Web

### Página de Configuración de Telegram
- [ ] Creé archivo `src/pages/settings/TelegramBotSettings.tsx`
- [ ] Página está en ruta `/settings/telegram`
- [ ] Usuarios pueden ver cómo usar el bot
- [ ] Se muestra el email del usuario
- [ ] Se explica el flujo de autenticación

### Tipos TypeScript
- [ ] Agregué `TelegramUser` interface
- [ ] Agregué `BotSession` interface
- [ ] Removí `UserPIN` interface (ya no necesaria)

---

## Testing en Desarrollo

### Bot Funcionando
- [ ] Ejecuté `npm run bot:dev`
- [ ] Sin errores en la consola
- [ ] Bot no se detiene

### Autenticación
- [ ] Abrí @PasaYa_Bot en Telegram
- [ ] Ejecuté `/start`
- [ ] Bot pidió email de ProSoftware
- [ ] Ingresé email correcto
- [ ] Bot pidió contraseña
- [ ] Ingresé contraseña correcta
- [ ] Credenciales fueron validadas contra Supabase Auth
- [ ] Menú principal apareció
- [ ] Sesión fue creada exitosamente

### Crear Visita
- [ ] Seleccioné "Nueva Visita"
- [ ] Ingresé nombre del visitante
- [ ] Ingresé teléfono (opcional)
- [ ] Ingresé fecha
- [ ] Ingresé hora (opcional)
- [ ] Ingresé propósito (opcional)
- [ ] Ingresé destino (opcional)
- [ ] Confirmé los datos
- [ ] Visita se creó exitosamente
- [ ] Recibí token QR

### Ver Visitas
- [ ] Seleccioné "Mis Visitas"
- [ ] Visita creada aparece en lista
- [ ] Status muestra "Pendiente"

### Funcionalidad Adicional
- [ ] `/new` crea nueva visita
- [ ] `/cancel` cancela operación
- [ ] `/start` abre menú principal
- [ ] Botones funcionan correctamente
- [ ] Menú principal responde

---

## Validación de Datos

### Email
- [ ] Acepta formato válido de email
- [ ] Rechaza emails inválidos
- [ ] Trim() elimina espacios

### Contraseña
- [ ] Se valida contra Supabase Auth
- [ ] No aparece en pantalla (por seguridad)
- [ ] Rechaza contraseñas incorrectas
- [ ] Distingue mayúsculas/minúsculas
- [ ] Acepta formato YYYY-MM-DD
- [ ] Rechaza otros formatos
- [ ] `/today` funciona

### Hora
- [ ] Acepta formato HH:MM
- [ ] Rechaza otros formatos
- [ ] `/skip` omite campo

### Nombre de Visitante
- [ ] No permite campo vacío
- [ ] Acepta caracteres especiales
- [ ] Trim() elimina espacios

---

## Base de Datos

### Conexión
- [ ] `npm run db:migrate` funciona (si existe script)
- [ ] Conexión a Supabase es exitosa
- [ ] Tablas existen y son accesibles

### Datos
- [ ] Usuario de Telegram se guarda en `telegram_users`
- [ ] Visita se guarda en `visits`
- [ ] Token QR se genera correctamente
- [ ] Session se crea correctamente

### Consultas
- [ ] Ver usuarios Telegram: `SELECT * FROM telegram_users`
- [ ] Ver visitas: `SELECT * FROM visits`
- [ ] Ver perfil del usuario: `SELECT * FROM profiles WHERE telegram_linked`

---

## Documentación

- [ ] `INSTALL_BOT.md` está completo
- [ ] `USER_GUIDE_BOT.md` está completo
- [ ] `IMPLEMENTATION_SUMMARY_BOT.md` está completo
- [ ] `bot/README.md` está completo
- [ ] `bot/.env.local` tiene todas las credenciales

---

## Seguridad

- [ ] Service Role Key no está comprometida
- [ ] `.env` está en `.gitignore`
- [ ] No hay credenciales en código
- [ ] PINs se validan correctamente
- [ ] Sesiones se limpian al salir

---

## Performance

- [ ] Bot responde en menos de 2 segundos
- [ ] Creación de visita es rápida
- [ ] Consultas a BD son eficientes
- [ ] Sem memory leaks visibles

---

## Errores Comunes

- [ ] Verificué permisos de Supabase
- [ ] Verificué RLS policies
- [ ] Verificué que tablas existan
- [ ] Verificué tipos TypeScript
- [ ] Verificué imports

---

## Antes de Producción

### Código
- [ ] Revisé `bot/server.ts` para lógica correcta
- [ ] Revisé `bot/services/*` para validaciones
- [ ] Revisé `bot/handlers/*` para flujos correctos
- [ ] No hay `console.log` de debugging
- [ ] Errores están bien manejados

### Deployment
- [ ] Decidí cómo ejecutar bot (polling vs webhooks)
- [ ] Si uso webhooks, configuré dominio
- [ ] Si uso polling, configuré servidor
- [ ] Base de datos en ambiente de producción
- [ ] Variables de entorno de producción

### Testing
- [ ] Testé con múltiples usuarios
- [ ] Testé casos de error
- [ ] Testé límites de datos
- [ ] Testé recuperación de fallos

---

## Comunicación

- [ ] Informé a residentes sobre nuevo bot
- [ ] Proporcioné guía de usuario
- [ ] Compartí contacto de soporte
- [ ] Explicé cómo usar credenciales ProSoftware
- [ ] Dejé claro que pueden usar mismo email/contraseña

---

## Post-Implementación

### Monitoring
- [ ] Logs están siendo capturados
- [ ] Errores están siendo registrados
- [ ] Puedo ver estado del bot
- [ ] Puedo ver actividad de usuarios

### Mantenimiento
- [ ] Actualicé `INSTALL_BOT.md` si cambió algo
- [ ] Cree backup de base de datos
- [ ] Documenté cualquier cambio
- [ ] Notifiqué al equipo
- [ ] Archivé notas de implementación

---

## Notas Adicionales

```
Fecha de Implementación: _________________
Versión del Bot: _________________________
Ambiente: [ ] Desarrollo [ ] Staging [ ] Producción

Notas:
__________________________________________________________
__________________________________________________________
__________________________________________________________
__________________________________________________________
```

---

**Checklist completado:** ___/___/______  
**Responsable:** _______________________  
**Verificado por:** _____________________
