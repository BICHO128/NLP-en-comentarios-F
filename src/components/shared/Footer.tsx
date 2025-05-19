const Footer = () => {
    return (
        <footer className="bg-gray-800 text-white py-2 sm:py-4 text-xs sm:text-sm transition-all duration-300">
            <div className="container mx-auto px-4 flex flex-col items-center">
                <div className="flex flex-col md:flex-row md:justify-between md:items-start w-full max-w-5xl mx-auto">
                    {/* Imagen y bloque de texto principal */}
                    <div className="flex flex-col md:flex-row items-start md:items-start w-full md:w-auto mb-6 md:mb-0">
                        <img
                            src="/imagenes/logo_autonoma.png"
                            alt="Logo Uniautonoma"
                            className="h-20 w-auto mb-4 md:mb-0 md:mr-2 mx-auto md:mx-4 object-contain"
                            style={{ minWidth: "60px" }}
                        />
                        <div className="flex flex-col items-start md:items-start text-start md:text-start">
                            <h3 className="text-xl font-bold text-start">
                                Corporación Universitaria Autónoma del Cauca
                            </h3>
                            <span className="text-gray-400 mb-4 text-start mt-4">
                                <span className="hidden md:inline">
                                    Proyecto de análisis de comentarios sobre la evaluación Docente <br /> por parte del Estudiante, mediante  el Procesamiento de Lenguaje <br /> Natural para la Corporación Universitaria Autónoma del Cauca.
                                </span>
                                <span className="inline md:hidden">
                                    Proyecto de análisis de comentarios estudiantiles  mediante el procesamiento de lenguaje natural para la Corporación Universitaria Autónoma del Cauca.
                                </span>

                            </span>
                        </div>
                    </div>
                    {/* Bloque de contacto */}
                    <div className="md:w-auto flex flex-col items-start md:items-start text-center md:text-start">
                        <h3 className="text-lg font-semibold mb-4 text-start">
                            Contacto
                        </h3>
                        <p className="text-gray-400 text-start">
                            Corporación Universitaria Autónoma del Cauca
                        </p>
                        <p className="text-gray-400 text-start">
                            Popayán, Cauca, Colombia
                        </p>
                        <a
                            href="https://www.uniautonoma.edu.co/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:text-blue-300 mt-2 inline-block text-start"
                        >
                            www.uniautonoma.edu.co
                        </a>
                    </div>
                </div>
                <div className="border-t border-gray-700 mt-8 pt-6 text-center text-gray-400 w-full">
                    <p>
                        &copy; {new Date().getFullYear()} Corporación Universitaria
                        Autónoma del Cauca. Todos los derechos reservados.
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;