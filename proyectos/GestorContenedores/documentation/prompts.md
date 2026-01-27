# Historial de Prompts y Evolución del Proyecto

Este documento registra las solicitudes clave que dieron forma a la aplicación, sirviendo como registro de la intención de diseño.

## 1. Definición Inicial (MVP)
> "Quiero hacer una aplicacion que compruebe contenedores dockers que tengo. Tienes que añadirle onbligatoriamente un Control de Ciclo de Vida... Códigos de Estado (Docker Health)... Gráficos de CPU y RAM... visor de Logs... y como ultimo paso añadir una terminal Web... Todo esto hazlo como una aplicacion local."

**Resultado**: Se diseñó la arquitectura Cliente-Servidor. El backend gestiona `dockerode` para comunicarse con el demonio local de Docker, ya que el navegador no puede hacerlo directamente por seguridad.

## 2. Implementación Técnica
> "Procede con el plan de implementacion"

**Resultado**:
- Creación de estructura `server` (Node) y `client` (Vite).
- Instalación de dependencias críticas: `dockerode` (Docker API), `socket.io` (Real-time data), `xterm` (Terminal web).

## 3. Verificación y Testing
> "no se muestra nada ahora mismo, es porque no tengo dockers verdad?"
> "Ahora dame un comando que insertar dentro del docker que ya hemos creado"

**Resultado**: Se guiaron pasos de verificación manual. Se proporcionó el comando `docker run -d --name demo-nginx -p 8080:80 nginx` para crear un entorno de pruebas inmediato.

## 4. Debugging y Correcciones
> "Al iniciarlo hay un erro con sidebar.jsx e index.css"
> "Al intentar iniciar usando este comando node index.js me da el siguiente error... EADDRINUSE"
> "Me sale el siguiente error: TypeError: containers.find is not a function"

**Resultado**:
- Se corrigieron rutas de importación (`../index.css`).
- Se solucionó conflicto de puertos matando el proceso huérfano de Node.
- Se añadió robustez en `App.jsx` para validar que la respuesta de la API sea un Array, previniendo pantallazos blancos si Docker falla.

## 5. Refactorización de UI (Master-Detail)
> "Haz que muestr el desglose de los datos en la derecha del contenedor seleccionado... mostrando lo que ahora pero solo del individual"
> "ajusta tambien el tamaño para que se vean de manera correcta"

**Resultado**:
- Cambio radical de diseño. De una "Grid de Tarjetas" a un layout "Master-Detail" (Lista a la izquierda, Detalles a la derecha).
- Creación del componente `ContainerDetail.jsx` con sistema de pestañas.
- Ajustes de CSS (`box-sizing: border-box`) para solucionar problemas de desbordamiento en las gráficas.
