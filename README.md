# Backend Chatbot SushiIA 🍣

Backend que gestiona el chatbot de pedidos de sushi SushiIA, implementando un asistente virtual llamado Nigiri. El sistema maneja productos, categorías, órdenes y brinda una experiencia conversacional natural mediante la integración con OpenAI.

## Características Principales 🌟

- Chatbot inteligente Nigiri entrenado con personalidad propia
- Sistema de pedidos en tiempo real con WebSocket
- Gestión completa de menú y categorías
- Sistema de delivery y pickup con validaciones
- Notificaciones en tiempo real de estados de pedidos
- Documentación interactiva con Swagger (Solo en modo desarrollo)
- Sistema de logging detallado
- Historial de conversaciones (30 minutos)
- Manejo de errores centralizado
- Validaciones robustas de datos

## Requisitos Técnicos 📋

- Node.js v16 o superior
- MongoDB v5 o superior
- Cuenta OpenAI con API key
- Variables de entorno configuradas

## Configuración Inicial 🛠️

1. **Clonar el repositorio**:

```bash
git clone [url-del-repo]
cd backend-sushi-chatbot
```

2. **Instalar dependencias**:

```bash
npm install
```

3. **Configurar variables de entorno**:
   - Copiar `.env.example` a `.env`
   - Completar las variables según el entorno

### Variables de Entorno (.env)

#### Desarrollo

```env
# Server
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/sushi-chatbot

# Zona horaria del restaurante
TIMEZONE_OFFSET=-3

# OpenAI
OPENAI_API_KEY=tu-api-key
ASSISTANT_ID=tu-assistant-id
```

#### Producción

```env
# Server
PORT=3000
NODE_ENV=production

# MongoDB
MONGO_USER=usuario
MONGO_PASSWORD=contraseña
MONGO_HOST=host
MONGO_PORT=27017
MONGO_DB=sushi-bot

# Zona horaria del restaurante
TIMEZONE_OFFSET=-3

# OpenAI
OPENAI_API_KEY=tu-api-key
ASSISTANT_ID=tu-assistant-id
```

## Estructura del Proyecto 📁

```
├── config/
│   └── database.js           # Configuración de MongoDB
├── logs/                     # Logs de la aplicación
├── scripts/                  # Scripts de utilidad
│   ├── loadCategories.js     # Script para cargar categorías
│   └── loadProducts.js       # Script para cargar productos
├── src/
│   ├── controllers/
│   │   ├── category.controller.js
│   │   ├── order.controller.js
│   │   └── product.controller.js
│   ├── middleware/
│   │   └── errorHandler.js   # Manejo centralizado de errores
│   ├── models/
│   │   ├── Category.js
│   │   ├── Order.js
│   │   └── Product.js
│   ├── routes/
│   │   ├── category.routes.js
│   │   ├── order.routes.js
│   │   └── product.routes.js
│   ├── services/
│   │   ├── event.service.js  # Gestión de eventos
│   │   ├── openai.service.js # Integración con OpenAI
│   │   └── socket.service.js # Gestión de WebSocket
│   └── utils/
│       └── errors.js         # Utilidades de error
├── tests/
│   ├── __tests__/           # Archivos de test
│   │   ├── category.test.js
│   │   ├── order.test.js
│   │   └── product.test.js
│   ├── fixtures/            # Datos de prueba
│   │   └── database.js
│   └── setup.js            # Configuración de tests
├── training/               # Archivos de entrenamiento del asistente
│   ├── entrenamiento_de_asistente.txt
│   └── assistentFunctions.json
└── server.js                 # Punto de entrada
```

## Testing 🧪

### Configuración de Tests

Los tests están configurados usando:

- Jest como framework principal
- Supertest para pruebas de endpoints
- MongoDB Memory Server para base de datos de pruebas

### Comandos de Testing

```bash
# Ejecutar todos los tests
npm test

# Ejecutar tests en modo watch
npm run test:watch

# Ejecutar tests con coverage
npm run test:coverage
```

## Data Seeding 🌱

### Cargar Datos de Desarrollo

Para cargar los datos iniciales en la base de datos de desarrollo:

```bash
# Cargar solo categorías
npm run seed:categories

# Cargar solo productos
npm run seed:products

# Cargar todo (categorías y productos)
npm run seed:all
```

### Datos Incluidos

- 13 categorías predefinidas para un restaurante de sushi
- 65 productos distribuidos en diferentes categorías
- Datos realistas y completos para testing

## Iniciar el Proyecto 🚀

### Desarrollo

```bash
npm run dev
```

### Producción

```bash
npm start
```

## API Endpoints 🛣️

### Categorías

- `GET /api/v1/categories` - Listar categorías
- `POST /api/v1/categories` - Crear categoría
- `PUT /api/v1/categories/:id` - Actualizar categoría
- `PATCH /api/v1/categories/:id/deactivate` - Desactivar categoría
- `PATCH /api/v1/categories/:id/activate` - Activar categoría

### Productos

- `GET /api/v1/products` - Listar productos
- `POST /api/v1/products` - Crear producto
- `PUT /api/v1/products/:id` - Actualizar producto
- `PATCH /api/v1/products/:id/deactivate` - Desactivar producto
- `PATCH /api/v1/products/:id/activate` - Activar producto

### Órdenes

- `GET /api/v1/orders` - Listar órdenes
- `GET /api/v1/orders/:orderNumber` - Obtener orden específica
- `POST /api/v1/orders` - Crear orden
- `PATCH /api/v1/orders/:orderNumber/status` - Actualizar estado

## WebSocket Events 🔌

### Cliente → Servidor

- `send_message`: Envío de mensajes al chatbot
- `subscribe_to_order`: Suscripción a actualizaciones de orden
- `unsubscribe_from_order`: Cancelar suscripción
- `reconnect_chat`: Reconexión de chat

### Servidor → Cliente

- `receive_message`: Respuestas del chatbot
- `bot_typing`: Indicador de escritura
- `error`: Notificación de errores
- `thread_created`: Nuevo hilo creado
- `timeout`: Timeout por inactividad

## Entrenamiento del Asistente 🤖

### Estructura de Archivos

```
├── training/
│   ├── entrenamiento_de_asistente.txt    # Instrucciones y personalidad
│   └── assistentFunctions.json           # Definición de funciones
```

### Funciones Disponibles

El asistente cuenta con las siguientes funciones definidas en `assistentFunctions.json`:

```javascript
[
  {
    name: "get_menu",
    description: "Obtener el menú completo",
  },
  {
    name: "create_order",
    parameters: {
      customer_name: "string",
      items: "array",
      delivery_type: "delivery|pickup",
    },
  },
  {
    name: "check_order_status",
    parameters: {
      order_number: "integer",
      customer_name: "string",
    },
  },
  {
    name: "cancel_order",
    parameters: {
      order_number: "integer",
      customer_name: "string",
    },
  },
  {
    name: "get_current_time",
  },
];
```

### Reglas de Comportamiento

El archivo `entrenamiento_de_asistente.txt` define:

1. **Identidad y Personalidad**

   - Nombre: Nigiri
   - Trato: Amigable y profesional
   - Uso moderado de emojis (🍱, 🍣)

2. **Validaciones Importantes**

   - Verificación de horarios con `get_current_time`
   - Consulta de menú con `get_menu`
   - Validación de productos y disponibilidad

3. **Proceso de Pedidos**

   - Solicitud de nombre
   - Verificación de productos
   - Confirmación de tipo de entrega
   - Resumen y número de orden

4. **Restricciones**
   - No mostrar menú completo en chat
   - Solo temas relacionados con el restaurante
   - Pedidos programados con 1 hora de anticipación
   - Cancelaciones solo en estado "pendiente"

### Configuración en OpenAI

1. Crearse una cuenta en [OpenAI](https://platform.openai.com)

2. Ir al dashboard de OpenAI y crear un nuevo asistente:

3. Copiar y pegar el archivo de entrenamiento en el apartado "System instructions". El archivo `training/entrenamiento_de_asistente.txt` contiene las instrucciones y la personalidad del asistente.

4. Cargar las funciones de entrenamiento en el apartado "Functions". Se deben cargar cada una por separado. El archivo `training/assistentFunctions.json` contiene las funciones disponibles.

5. Elegir el modelo del asistente. En las pruebas se uso el modelo `gpt-4o-mini` al ser mas economico y admitir mas tokens por minuto (TPM : 200k). El modelo `gpt-4o` es mas inteligente, mas caro y admite menos tokens por minuto (TPM : 30k). Para pruebas quizas sea suficiente usar `gpt-4o` teniendo mejores resultados. Pero para produccion, si se espera mayor volumen de conversaciones, se recomienda usar `gpt-4o-mini`.
   Igualmente estos limites aumenta si se sube de Categoria (Tier).

6. Se recomienda colocar la `Temperature` en `0.80` y la `Top P` en `1`. Esto le da libertad a la IA para generar respuestas creativas pero no al punto de responder "inventando" informacion.

7. Una vez creado el asistente se debe crear la API KEY dandole todos los permisos.

8. Copiar la API KEY y el ASSISTANT ID y pegarlos en el archivo `server.js` en las variables `OPENAI_API_KEY` y `ASSISTANT_ID`.

```bash
# Variables de entorno necesarias
OPENAI_API_KEY=tu-api-key
ASSISTANT_ID=tu-assistant-id
```

## Reglas de Negocio 📋

- **Horario**: 11:30 a 23:00
- **Delivery**:
  - Tiempo estimado: 30-45 minutos
  - Preparación: 20-30 minutos
  - Costo: GRATIS
- **Pedidos programados**: Mínimo 1 hora de anticipación
- **Cancelaciones**: Solo en estado "pendiente"

## Sistema de Logging 📝

El sistema implementa logging detallado usando Winston:

- **Desarrollo**: Consola + archivos
- **Producción**: Solo archivos
- **Niveles**: error, warn, info
- **Ubicación**: `/logs/`
  - `error.log`: Errores críticos
  - `combined.log`: Todos los logs

## Manejo de Errores ⚠️

Sistema centralizado de errores con:

- Tipos predefinidos de errores
- Respuestas estandarizadas

## Seguridad 🔒

- Validación de datos
- Sanitización de entradas

## Monitoreo

### Logs

- Revisar `/logs/error.log` para errores
- Monitorear `/logs/combined.log` para actividad general

## Errores Comunes 🔧

### Conexión MongoDB

- Verificar credenciales
- Comprobar URL de conexión

### OpenAI

- Validar API key
- Verificar cuota/saldo
- Comprobar ID del asistente

### WebSocket

- Revisar configuración CORS
- Verificar límites de conexión
- Comprobar timeouts

## Interacción con el Chatbot 🤖

Nigiri es un asistente virtual inteligente capaz de mantener conversaciones naturales y fluidas. Puedes hablar con él como lo harías con cualquier persona, pero también entiende comandos y consultas específicas.

### Ejemplos de Conversación Natural

```
👤 "Hola! Quiero pedir sushi"
🤖 "¡Hola! Soy Nigiri, tu asistente de SushiIA 🍣 ¿Podrías decirme tu nombre, por favor?"

👤 "Me podrías recomendar algo? Es mi primera vez"
🤖 "¡Por supuesto! Tenemos varios rolls ideales para principiantes. ¿Te gustan las opciones más tradicionales o prefieres probar algo con un toque especial?"

👤 "No sé qué pedir para compartir entre 4 personas"
🤖 "¡Te puedo ayudar con eso! Para 4 personas, te recomiendo..."
```

### Consultas Específicas que Puedes Hacer

- 📋 Ver el menú: "¿Me muestras el menú?" / "¿Qué platos tienen?"
- 🔍 Estado de orden: "¿Cómo va mi pedido #123?"
- ❌ Cancelar orden: "Necesito cancelar mi orden #123"
- ⏰ Horarios: "¿Hasta qué hora están abiertos?"

### Funcionalidades Principales

- 🛵 Pedidos para delivery o pickup
- 🕒 Programación de pedidos con anticipación
- 💬 Consultas sobre ingredientes y preparación
- 📱 Seguimiento de estado de pedidos
- ❓ Recomendaciones personalizadas

El bot está diseñado para brindarte una experiencia personalizada, recordando tu nombre durante toda la conversación y adaptándose a tus preferencias.
