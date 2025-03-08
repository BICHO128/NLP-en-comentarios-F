import { useState, useEffect } from 'react';

import Estudiantes from './components/Estudiantes';
import Docentes from './components/Docentes';
import Administrador from './components/Administrador';

function App() {
  const [activeTab, setActiveTab] = useState('student');
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsScrolled(scrollPosition > 0);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className={`${isScrolled ? 'fixed top-0 left-0 right-0 z-50 shadow-lg' : ''} bg-blue-800 text-white transition-all duration-300 shadow-md`}>
        <div className="container mx-auto px-4 py-2 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <h1 className="text-3xl font-bold">Corporación Universitaria Autónoma del Cauca</h1>
          </div>
          <div className="flex items-center">
            <img 
              src="/public/imagenes/logo_autonoma.svg" 
              alt="Logo Uniautonoma" 
              className="h-15 w-20"
            />
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className={`bg-white shadow-sm ${isScrolled ? 'mt-[56px]' : ''}`}>
        <div className="container mx-auto px-4">
          <ul className="flex space-x-6">
            <li>
              <button 
                onClick={() => setActiveTab('student')}
                className={`py-4 px-1 border-b-2 ${activeTab === 'student' ? 'border-blue-500 text-blue-600' : 'border-transparent'} font-medium`}
              >
                Estudiante
              </button>
            </li>
            <li>
              <button 
                onClick={() => setActiveTab('teacher')}
                className={`py-4 px-1 border-b-2 ${activeTab === 'teacher' ? 'border-blue-500 text-blue-600' : 'border-transparent'} font-medium`}
              >
                Docente
              </button>
            </li>
            <li>
              <button 
                onClick={() => setActiveTab('admin')}
                className={`py-4 px-1 border-b-2 ${activeTab === 'admin' ? 'border-blue-500 text-blue-600' : 'border-transparent'} font-medium`}
              >
                Administrador
              </button>
            </li>
          </ul>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-grow container mx-auto px-4 py-8">
        {activeTab === 'student' && <Estudiantes />}
        {activeTab === 'teacher' && <Docentes />}
        {activeTab === 'admin' && <Administrador />}
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between">
            <div className="mb-6 md:mb-0">
              <div className="flex items-center space-x-2 mb-4">
                <img 
                  src="/public/imagenes/logo_autonoma.png" 
                  className="h-20 w-30"
                />
                <h2 className="text-xl font-bold">Corporación Universitaria Autónoma del Cauca</h2>
              </div>
              <p className="text-gray-400 max-w-md">
                Proyecto de análisis de comentarios estudiantiles mediante procesamiento de lenguaje natural para la Corporación Universitaria Autónoma del Cauca.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Contacto</h3>
              <p className="text-gray-400">Corporación Universitaria Autónoma del Cauca</p>
              <p className="text-gray-400">Popayán, Cauca, Colombia</p>
              <a 
                href="https://www.uniautonoma.edu.co/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 mt-2 inline-block"
              >
                www.uniautonoma.edu.co
              </a>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-6 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} Corporación Universitaria Autónoma del Cauca. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
