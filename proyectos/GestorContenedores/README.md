# Gestor de Contenedores Docker (Docker Pulse)

Una aplicación web moderna para gestionar contenedores Docker de forma local. Permite controlar el ciclo de vida, ver estadísticas en tiempo real, visualizar logs y acceder a una terminal interactiva, todo desde una interfaz unificada.

## 🚀 Características

*   **Dashboard Visual**: Semáforos de estado (Verde/Amarillo/Rojo) para identificar salud de contenedores.
*   **Control Total**: Start, Stop, Restart, Pause/Resume desde la UI.
*   **Monitorización**: Gráficas en tiempo real de CPU y Memoria RAM (comparado contra el límite asignado).
*   **Logs en vivo**: Visor de logs streaming (stdout/stderr).
*   **Terminal Web**: Acceso `exec` directo al contenedor (/bin/sh) desde el navegador.
*   **Alertas Inteligentes**: Detección automática de "OOM Killed" (Out Of Memory).

## 🛠️ Requisitos Previos

*   **Docker Desktop** (o Docker Engine en Linux) corriendo localmente.
*   **Node.js** (v18 o superior) instalado.

## 📦 Instalación y Ejecución

La forma más sencilla de ejecutar el proyecto es utilizando **Docker Compose**. Esto levantará tanto el **Cliente** como el **Servidor** configurados automáticamente.

### Opción 1: Inicio Rápido con Docker Compose (Recomendado)

1.  Clona el repositorio:
    ```bash
    git clone <URL_DEL_REPOSITORIO>
    cd GestorContenedores
    ```
2.  Ejecuta el comando:
    ```bash
    docker-compose up --build
    ```
3.  Abre tu navegador en:
    *   💻 **Interfaz Web:** http://localhost:5173

> **Nota:** El servidor backend se iniciará en el puerto 3000 y el cliente en el 5173. Asegúrate de tener estos puertos libres.

---

### Opción 2: Instalación Manual

Si prefieres ejecutar cada parte por separado para desarrollo:

#### 1. Iniciar el Backend
```bash
cd server
npm install
node index.js
```

#### 2. Iniciar el Frontend
En una nueva terminal:
```bash
cd client
npm install
npm run dev
```

## 🔧 Solución de Problemas Comunes

**Pantalla en blanco o "Failed to load containers":**
*   Asegúrate de que Docker Desktop está corriendo.
*   Verifica que el Backend (`node index.js`) no dio error al iniciar.

**Error EADDRINUSE (Puerto ocupado):**
*   Si el puerto 3000 está ocupado, busca en tu administrador de tareas procesos de `node` y ciérralos, o reinicia el equipo.

**Ejemplo de Contenedor de Prueba:**
Si no tienes contenedores, crea uno ligero para probar:
```bash
docker run -d --name demo-nginx -p 8080:80 nginx
```

## 🏗️ Stack Tecnológico

*   **Backend**: Node.js, Express, Socket.io, Dockerode.
*   **Frontend**: React, Vite, Lucide Icons, Recharts (Gráficas), XTerm.js (Terminal).
