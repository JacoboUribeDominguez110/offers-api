# 📡 Backend en NestJS con WebSockets y Redis

Este proyecto es un backend en **NestJS** que utiliza **WebSockets** para la comunicación en tiempo real de eventos entre usuarios de la aplicación y **Redis** como un contenedor para manejar el almacenamiento en caché de las ofertas mencionadas.

## 🚀 Características Principales
- Implementación de **WebSockets** en NestJS.
- Uso de **Redis** para manejar eventos en tiempo real.
- Integración con **Docker** para contenerizar Redis.
- Desarrollado con **Node.js 22**.

## 🛠 Tecnologías Utilizadas
- [NestJS](https://nestjs.com/)
- [WebSockets](https://docs.nestjs.com/websockets/gateways)
- [Redis](https://redis.io/)
- [Docker](https://www.docker.com/)
- [TypeScript](https://www.typescriptlang.org/)

## 📦 Instalación y Configuración

### 1️⃣ Requisitos Previos
Asegúrate de tener instalado:
- [Node.js 22](https://nodejs.org/en/download/)
- [Docker](https://www.docker.com/get-started)

### 2️⃣ Clonar el Repositorio
```sh
git clone https://github.com/JacoboUribeDominguez110/offers-api.git
cd tu-offers-api
```

### 3️⃣ Instalar Dependencias
```sh
npm install
```

### 4️⃣ Configurar Variables de Entorno
Modificar archivos `.env.development` en la raíz del proyecto y agrega:
```
JWT_SECRET=
REDIS_HOST=
REDIS_PORT=
PORT=
SOCKET_PORT=
```

### 5️⃣ Levantar Redis con Docker
```sh
docker run --name redis-container -p puerto:6379 -d redis
```

### 6️⃣ Ejecutar el Servidor
```sh
npm run start:dev
```

## ▶️ Uso
- La aplicación expone una conexión WebSocket en `ws://localhost:socket_port`.
- Se pueden enviar y recibir eventos en tiempo real.

## 📚 Estructura del Proyecto
```
/src
  ├── auth          # Manejo de JWT
  ├── gateway       # Implementación de WebSockets
  ├── models        # Enums e interface utiles
  ├── offers        # Servicios con implementación de lógica para ofertas
  ├── redis         # Lógica para implementar métodos comunes de redis
  ├── scheduler     # Implementaciones de cronjobs para desactivación de ofertas
  ├── main.ts       # Punto de entrada principal
```

## 🧪 Pruebas
Para ejecutar pruebas unitarias:
```sh
npm run test
```

Para pruebas e2e:
```sh
npm run test:e2e
```

## 🛠 Despliegue
Para compilar el proyecto en producción:
```sh
npm run build
```

Para correr en modo producción:
```sh
npm run start:prod
```

## 🖋 Contribuir
Si deseas contribuir, por favor crea un **issue** o envía un **pull request**.

## 👨‍💻 Autor
- **Jacobo Uribe Dóminguez** - [GitHub](https://github.com/tu-usuario)

## 📝 Licencia
Este proyecto está bajo la licencia **MIT**.

