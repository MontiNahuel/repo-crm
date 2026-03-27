<div align='center'>
  
  # 🚀 Mi CRM - Frontend App
  
  Un sistema de Gestión de Relaciones con Clientes (CRM) moderno, rápido y escalable. Diseñado con foco en la experiencia de usuario (UX), reduciendo la fricción mediante interacciones en línea y un diseño limpio y adaptable.
  
  ## 🛠️ Stack Tecnológico
  
  [![Vue.js](https://img.shields.io/badge/Vue.js-35495E?style=for-the-badge&logo=vuedotjs&logoColor=4FC08D)](https://vuejs.org/) [![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/) [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/) [![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=FFD62E)](https://vitejs.dev/) [![Vue Router](https://img.shields.io/badge/Vue_Router-42b883?style=for-the-badge&logo=vue.js&logoColor=white)](https://router.vuejs.org/) [![Pinia](https://img.shields.io/badge/Pinia-FFE162?style=for-the-badge&logo=pinia&logoColor=black)](https://pinia.vuejs.org/) [![Axios](https://img.shields.io/badge/Axios-5A29E4?style=for-the-badge&logo=axios&logoColor=white)](https://axios-http.com/)
</div>

## ✨ Características Principales

* **Manejo de cartera de Clientes:** Permite registrar clientes los cuales contienen un estado en el que se encuentran (activo, inactivo, perdido, etc.), y un registro de datos de contacto.
* **Registro de tareas (tasks):** Permitiendo registrar tareas asociadas al trabajador propio que usa el sistema o a un cliente determinado, estas mismas están integradas con el flujo de la aplicación, mostrandose en puntos claves. Ej: Junto al perfil detallado del cliente.
* **Manejo de Notas:** Notas de rápida escritura por si se tiene que anotar algo en clave, como por ejemplo en una reunión.
* **Integración con IA:** Se utiliza la IA para puntos de interés clave, como por ejemplo analizar las notas rápidas escritas, delegandolas en tareas asignadas a ese cliente, todo este proceso automatizado.
* **Gestión de KPIs:** Medidores clave para cualquier vendedor, dentro de la pantalla inicial para saber en que estado se encuentra.
* **Manejo de una cartera de productos (en construcción):** Se permite un manejo de productos, los cuales estarán asociados a un cliente, para un mayor seguimiento de este mismo.
* **Manejo de roles permitiendo grupos de vendedores (en construcción):** Permitir grupos de vendedores es una ventaja estratégica, así el compartir información necesaria entre grupos de ventas se hace de forma instantanea.
* **Creación de facturas en base al cliente y el/los productos asociados (en construcción):** Generar datos de tipo venta es obligatorio para extender el sistema en el futuro hacia una parte contable. Ej: Rendimiento mensual.

## 📂 Estructura del Proyecto

El código fuente está organizado para facilitar la escalabilidad hacia un ecosistema mayor (tipo ERP/SaaS):

```text
src/
├── components/       # Componentes visuales reutilizables (Botones, Modales, ui)
├── composables/      # Lógica de negocio e integración con UI
├── core/             # Dependencias, utilidades y formateadores globales
├── interfaces/       # Contratos de TypeScript (Tipos y modelos de datos para Frontend/Backend)
├── layouts/          # Estructuras base y envolturas de las páginas (MainLayout con su Sidebar y Header dinámico)
├── router/           # Configuración de Vue Router con metadatos (meta tags)
├── services/         # Llamadas HTTP a FastAPI separadas por dominio (clientes, notas, tareas)
├── stores/           # Gestión del estado global de la aplicación (Pinia para sesión de usuario, permisos, etc.)
├── views/            # Páginas principales de la aplicación (Dashboard, ClienteDetalle)
└── App.vue           # Componente raíz
```

## 🚀 Instalación y Uso Local

Sigue estos pasos para levantar el entorno de desarrollo en tu máquina:
1. Clonar el repositorio

```bash
git clone [https://github.com/MontiNahuel/repo-crm.git](https://github.com/MontiNahuel/repo-crm.git)
cd repo-crm
```

2. Instalar dependencias

```bash
npm install
# o usando yarn: yarn install
```

3. Levantar el servidor de desarrollo

```bash
npm run dev
```