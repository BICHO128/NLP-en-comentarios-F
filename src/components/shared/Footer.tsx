

const Footer = () => {
    return (
        <footer className="bg-gray-800 text-white py-8 mt-auto">
            <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row justify-between">
                    <div className="mb-6 md:mb-0 md:w-1/2">
                        <div className="flex items-center space-x-2 mb-4">
                            <img
                                src="/imagenes/logo_autonoma.png"
                                alt="Logo Uniautonoma"
                                className="h-12"
                            />
                            <h2 className="text-xl font-bold">Corporación Universitaria Autónoma del Cauca</h2>
                        </div>
                        <p className="text-gray-400 max-w-md">
                            Proyecto de análisis de comentarios estudiantiles mediante procesamiento de lenguaje natural para la Corporación Universitaria Autónoma del Cauca.
                        </p>
                    </div>
                    <div className="md:w-1/2">
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
    );
};

export default Footer;