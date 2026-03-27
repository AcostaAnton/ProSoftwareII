# 📱 Guía de Usuario - Bot de Telegram PasaYa

## ¿Qué es PasaYa?

**PasaYa** es un bot de Telegram que te permite registrar visitas a tu comunidad de forma rápida y segura. Está diseñado para facilitar la solicitud de acceso a tu hogar sin tener que usar la aplicación web.

## 🔐 Requisitos Iniciales

Antes de usar el bot, necesitas:

1. ✅ Tener una cuenta activa en ProSoftware
2. ✅ Conocer tu email y contraseña de ProSoftware
3. ✅ Tener Telegram instalado en tu teléfono

## ⚙️ Paso 1: Preparar tus Credenciales

### Necesitarás:

1. Tu **email** registrado en ProSoftware
2. Tu **contraseña** de ProSoftware

**Importante:** Estos son los mismos datos que usas para iniciar sesión en la aplicación web.

✅ **¡Listo!** Ya tienes lo que necesitas

## 📲 Paso 2: Abrir el Bot en Telegram

### Opción 1: Buscar el Bot
1. Abre Telegram
2. Toca el botón de búsqueda 🔍
3. Escribe `@PasaYa_Bot` o `PasaYa`
4. Selecciona el bot (debe tener el ícono azul de ProSoftware)
5. Toca **START** (Iniciar)

### Opción 2: Usar el Enlace Directo
- Abre este enlace en tu navegador: [t.me/PasaYa_Bot](https://t.me/PasaYa_Bot)
- Telegram se abrirá automáticamente
- Toca **START**

## 🔑 Paso 3: Autenticarte con tus Credenciales

1. El bot te pedirá tu **email de ProSoftware**
   - Ingresa el mismo email que usas para iniciar sesión
   
2. El bot te pedirá tu **contraseña de ProSoftware**
   - La contraseña no aparecerá en pantalla (por seguridad)
   - Escríbela cuidadosamente
   
3. El bot verificará tus credenciales
4. El bot mostrará un mensaje de bienvenida

✅ **¡Autenticación exitosa!**

Si cometes un error, el bot te pedirá que intentes de nuevo.

## ➕ Paso 4: Registrar una Nueva Visita

### Opción 1: Usar el Botón
1. En el menú principal, toca **➕ Nueva Visita**

### Opción 2: Usar el Comando
- Escribe `/new` en cualquier momento

### Formulario de Visita:

El bot te pedirá la siguiente información:

**1. Nombre del Visitante** (requerido)
   - Ejemplo: "Juan Pérez"

**2. Teléfono del Visitante** (opcional)
   - Ejemplo: "123456789"
   - Si no deseas ingresarlo, escribe `/skip`

**3. Fecha de Visita** (requerido)
   - Formato: `YYYY-MM-DD`
   - Ejemplo: `2026-03-27`
   - O usa `/today` para hoy

**4. Hora de Visita** (opcional)
   - Formato: `HH:MM`
   - Ejemplo: `14:30`
   - O usa `/skip`

**5. Propósito de Visita** (opcional)
   - Ejemplos: "Reparación", "Entrega", "Visita", "Mantenimiento"
   - O usa `/skip`

**6. Destino de Visita** (opcional)
   - Ejemplos: "Apartamento 501", "Piscina", "Área común"
   - O usa `/skip`

### Confirmación:

1. El bot mostrará un resumen de la información
2. Verifica que todo sea correcto
3. Toca **✅ Confirmar** para crear la visita
4. O toca **❌ Cancelar** para empezar de nuevo

✅ **¡Visita Registrada!**

Recibirás:
- Confirmación de que la visita fue registrada
- Código QR único para la visita
- Estado: "Pendiente de Aprobación"

## 📋 Ver tu Historial de Visitas

1. Desde el menú principal, toca **📋 Mis Visitas**
2. Verás tus últimas 10 visitas registradas
3. Cada visita muestra:
   - Nombre del visitante
   - Fecha de visita
   - Estado (⏳ Pendiente, ✅ Aprobada, ❌ Rechazada, etc.)

## ⚙️ Menú del Bot

Después de autenticarte, tienes acceso a:
- **➕ Nueva Visita** - Registrar una nueva solicitud de visita
- **📋 Mis Visitas** - Ver el historial de tus visitas
- **❌ Salir** - Cerrar sesión

## ❌ Salir del Bot

- Toca **❌ Salir** desde el menú principal
- O escribe `/cancel` en cualquier momento
- Para volver a entrar, usa `/start`

## ❓ Preguntas Frecuentes

### ¿Qué pasa si olvido mi contraseña?

Si olvidas tu contraseña:
1. Ve a la aplicación web de ProSoftware
2. Busca la opción "¿Olvidaste tu contraseña?"
3. O contacta a la administración de tu comunidad
4. Una vez recuperes tu contraseña, usa la nueva en el bot

### ¿Puedo cambiar mi contraseña?

Sí, en cualquier momento:
1. En la app web de ProSoftware → Configuración → Cambiar Contraseña
2. La nueva contraseña se usará automáticamente la próxima vez que accedas al bot

### ¿Las credenciales son seguras?

Sí:
- Las credenciales se validan contra Supabase Auth (el mismo sistema que la app web)
- Las contraseñas nunca se almacenan en el bot
- Se usan solo para verificar tu identidad

### ¿Qué significa "Pendiente de Aprobación"?

Significa que tu solicitud de visita ha sido registrada pero aún necesita ser revisada y aprobada por la administración. El estado cambiará cuando sea aprobada.

### ¿Cuántas visitas puedo registrar?

No hay límite. Puedes registrar tantas visitas como necesites.

### ¿Qué datos se comparten?

- Solo la información que tú proporciones al bot
- Se almacena de forma segura en la plataforma ProSoftware
- Solo administradores y personal de seguridad pueden ver los datos

### ¿El bot funciona en horario específico?

No, el bot está disponible 24/7. Puedes registrar visitas en cualquier momento.

### ¿Qué pasa si ingreso el PIN incorrecto?

El bot te lo dirá y te pedirá que intentes de nuevo. Después de varios intentos fallidos, por seguridad, podrías tener que esperar un tiempo.

## 🆘 Solución de Problemas

### "Usuario de Telegram no encontrado"
- Verifica que estés usando la cuenta de Telegram correcta
- Tu cuenta de Telegram se vinculará automáticamente con tu usuario de ProSoftware al autenticarte

### "Credenciales inválidas"
- Verifica que escribiste correctamente el email y la contraseña
- La contraseña distingue mayúsculas de minúsculas
- Si olvidaste la contraseña, cámbiala en la app web primero

### "No tienes acceso"
- Solo residentes y administradores pueden usar el bot
- Contacta a la administración si crees que debes tener acceso

### "El bot no responde"
- Verifica tu conexión a internet
- Cierra el bot y vuelve a abrirlo: `/start`
- Si el problema persiste, reporta en la app web

## 📞 Soporte

Si tienes problemas:
1. Revisa esta guía nuevamente
2. Contacta a la administración de tu comunidad
3. Reporta el problema en la app web de ProSoftware

---

**¡Disfruta usando PasaYa!** 🎉
