# 📱 Frontend - Sistema de Evaluación Docente con NLP

Interfaz web desarrollada en **React + TypeScript (TSX)** para el sistema de evaluación docente, permitiendo a estudiantes, docentes y administradores interactuar con las evaluaciones, consultar reportes y gestionar recursos.

---

## 📌 Tecnologías Utilizadas

- **React JS** v18.2.0
- **TypeScript** v5.4.0
- **Tailwind CSS** v3.4.1
- **React Router DOM** v6.22.3
- **Axios** v1.6.7
- **React Toastify** v9.2.2
- **zustand**
- **Vercel** (para despliegue frontend)

---

## 📌 Instalación

1. Clonar repositorio

   ```bash
   git clone https://github.com/BICHO128/NLP-en-comentarios-F.git
   cd frontend
   ```

2. Instalar dependencias

   ```bash
   npm install
   ```

3. Ejecutar servidor local
   ```bash
   npm run dev
   ```

---

## 📌 Variables de Entorno

Crear un archivo `.env` en raíz:

```
VITE_API_URL=http://localhost:5000
```

---

## 📌 Estructura de Carpetas

```
📦src
 ┣ 📂components
   ┣ 📂Administrador.tsx
   ┣ 📂Estudiante.tsx
   ┣ 📂Docente.tsx
 ┣ 📂pages
   ┣ 📂Panel_admin.tsx
   ┣ 📂Panel_estudiante.tsx
   ┣ 📂Panel_docente.tsx
 ┣ 📂utils
 ┣ 📂services
 ┣ 📂hooks
 ┣ 📂styles
 ┣ 📂types
 ┣ 📂stores
 ┣ 📜App.tsx
 ┣ 📜main.tsx
 ┣ 📜index.css
 ┣ 📜vite.config.ts
```

---

## 📌 Funcionalidades Principales

- Iniciar sesión con autenticación JWT.
- Registrar evaluaciones docentes.
- Visualizar reportes PDF.
- Descargar reportes Excel.
- Panel de administración con CRUD de usuarios, docentes, cursos y criterios.
- Consumo de APIs REST desde Flask backend.
- Diseño responsivo para escritorio y móvil.

---

## 📌 Librerías Destacadas

- **Axios:** Consumo de APIs.
- **React Router DOM:** Navegación SPA.
- **Tailwind CSS:** Estilos responsivos.
- **React Toastify:** Notificaciones.
- **zustand:** Manejo de estado global.
- **Vercel:** Despliegue frontend.

---

## 📌 Despliegue

- **Frontend:** Vercel.

---

## 📌 Autor

**David Urrutia Cerón**  
Estudiante de Ingeniería de Software y Computación,
Corporación Universitaria Autónoma del Cauca
