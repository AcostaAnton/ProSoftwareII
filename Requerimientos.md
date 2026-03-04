# 🏢 Sistema de Gestión de Visitas en Residencial

---

## 1️⃣ Objetivo del Sistema

Desarrollar una aplicación que permita gestionar y controlar el ingreso y salida de visitas en una residencial, garantizando **seguridad**, **trazabilidad** y **registro histórico**.

---

## 2️⃣ Requerimientos Funcionales

### 2.1 Gestión de Usuarios

**Funcionalidades:**
- Registro de residentes
- Registro de guardias de seguridad
- Registro de administrador
- Inicio de sesión con autenticación
- Recuperación de contraseña

**Roles del Sistema:**
- 👤 **Administrador** - Gestión total del sistema
- 👮 **Guardia** - Control de ingreso/salida
- 🏠 **Residente** - Autorizar visitas

---

### 2.2 Registro de Visitas

El sistema debe permitir **registrar nueva visita** con los siguientes datos:

**Datos requeridos:**
- Nombre completo del visitante
- Identidad / DPI / Pasaporte
- Fotografía del visitante
- Número de placa del vehículo (si aplica)
- Casa o lote a visitar
- Nombre del residente
- Motivo de visita
- Fecha y hora de ingreso
- Fecha y hora de salida
- Estado: `Pendiente | Autorizada | Denegada | Finalizada`

---

### 2.3 Autorización de Visitas

**El residente puede:**
- ✅ Autorizar visitas previamente
- ❌ Denegar solicitudes
- 📋 Ver historial de visitas

**Notificaciones en tiempo real:**
- 🔔 Cuando llega una visita
- ❓ Cuando se solicita autorización

---

### 2.4 Control de Ingreso y Salida

- ✔️ **Check-in** de visitante
- ✔️ **Check-out** de visitante
- ⏰ Registro automático de fecha y hora
- 👀 Control de visitas activas dentro de la residencial

---

### 2.5 Historial y Reportes

**Historial filtrable por:**
- 📅 Fecha
- 🏠 Casa
- 👤 Visitante

**Exportación de reportes en:**
- 📄 PDF
- 📊 Excel

**Tipos de reporte:**
- Visitas por día
- Visitas por residente
- Visitas rechazadas

---

### 2.6 Seguridad (Funcional)

- 📷 Captura de fotografía
- 📱 Escaneo de documento (opcional)
- 🚗 Registro de placa vehicular
- 📝 Bitácora de acciones (logs)
- 👤 Registro de usuario que realizó cada acción

---

## 3️⃣ Requerimientos No Funcionales

### 3.1 Seguridad

- 🔐 Encriptación de contraseñas
- 🔑 JWT o sistema de autenticación seguro
- 👥 Control de acceso por roles
- 🔒 HTTPS obligatorio

---

### 3.2 Rendimiento

- ⚡ Tiempo de respuesta menor a **2 segundos**
- 👥 Soporte mínimo para **50–200 usuarios concurrentes**

---

### 3.3 Disponibilidad

- 🟢 Sistema disponible **24/7**
- 💾 Backup automático **diario**

---

### 3.4 Usabilidad

- 🎨 Interfaz simple para guardias
- 🔘 Botones grandes y visibles
- 📱 Compatible con **tablet** y **móvil**

---