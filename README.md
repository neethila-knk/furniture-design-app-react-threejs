# Furniture Design & Visualization Application

A comprehensive web-based application for furniture design visualization that empowers interior designers to create, customize, and visualize room layouts with photorealistic rendering in both 2D and 3D views.

![Furniture Design App Screenshot](https://i.ibb.co/tpC0rq5c/Screenshot-2025-05-11-195249.png)

## 🌟 Features

- **Room Setup**: Configure room dimensions, shapes, and color schemes with intuitive controls
- **Furniture Library**: Browse and select from an extensive catalog of pre-modeled furniture items
- **2D Layout Tools**: Drag, rotate, and scale furniture in a top-down view with precision controls
- **3D Visualization**: Convert 2D layouts to realistic 3D renders with lighting and shadow effects
- **Customization Options**: Change colors, textures, materials, and shading in real-time
- **Save & Load**: Persist designs for later use with cloud synchronization
- **User Authentication**: Secure access for designers with role-based permissions
- **Material Library**: Apply various textures and materials to furniture and room surfaces

## 🛠️ Technology Stack

- **Frontend**: React.js with Context API and Zustand for state management
- **Styling**: Tailwind CSS for responsive design with custom UI components
- **2D Rendering**: HTML Canvas API with optimized drawing algorithms
- **3D Rendering**: Three.js with WebGL for high-performance rendering
- **3D Models**: GLB format for optimized loading and performance
- **Environment Maps**: HDR images for physically-based realistic lighting
- **Storage**: LocalStorage API for client-side persistence, Firebase for cloud storage

## 🚀 Installation

1. Clone the repository:
```bash
git clone https://github.com/neethila-knk/furniture-design-app-react-threejs.git
cd furniture-design-app-react-threejs
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to:
```
http://localhost:5173
```

## 📋 Usage Guide

### Authentication
- Use the login screen to access the application
- Demo credentials are provided on the login page

### Creating a New Design
1. Navigate to the dashboard and select "Create New Design."
2. Set up the room dimensions, shape, and color scheme using the room configurator
3. Add furniture from the furniture library by browsing categories or using the search function
4. Arrange items in the 2D view (drag to position, click to select, use handles to rotate)
5. Use the controls panel to precisely rotate, scale, and position selected items
6. Switch to 3D view to see a realistic visualization with accurate lighting and shadows
7. Customize colors, textures, and materials from the materials panel
8. Adjust lighting conditions and environment settings for different times of day
9. Save your design with a name and optional description

## 💻 System Requirements

- **Browser**: Latest versions of Chrome, Firefox, Safari, or Edge
- **Graphics**: WebGL-compatible graphics card for 3D rendering
- **Internet**: Broadband connection for model loading and cloud features
- **Screen**: Minimum resolution of 1280x720, recommended 1920x1080 or higher

## 🔍 Demo

- Live demo: [YouTube Presentation](https://youtu.be/Rxf8_zEzFoo)
- Interactive demo: [Try the App](https://furniture-design-app.example.com)
- GitHub repository: [Source Code](https://github.com/neethila-knk/furniture-design-app-react-threejs.git)

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgements

- 3D models from [Sketchfab](https://sketchfab.com) and [TurboSquid](https://turbosquid.com)
- HDR environment maps from [Polyhaven](https://polyhaven.com)
- Icons provided by [Heroicons](https://heroicons.com) and [Font Awesome](https://fontawesome.com)
- UI components inspired by [Tailwind UI](https://tailwindui.com)

---

*Developed as part of BSc (Hons) Software Engineering at Plymouth University, UK.*
