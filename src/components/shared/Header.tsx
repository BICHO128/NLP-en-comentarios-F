import React from 'react';

interface HeaderProps {
    onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ onLogout }) => {
    return (
        <header className="bg-blue-800 text-white w-full transition-all duration-300">
            <div className="container mx-auto px-4 py-4 flex flex-row items-center justify-between flex-wrap transition-all duration-300">
                {/* Logo y nombre */}
                <div className="flex flex-row items-center min-w-0 transition-all duration-300">
                    <img
                        src="/imagenes/logo_autonoma.png"
                        alt="Logo Uniautonoma"
                        className="h-16 sm:h-12 md:h-12 lg:h-20 w-auto mr-6"
                        style={{ minWidth: "48px" }}
                    />
                    <span className="font-bold text-base sm:text-lg md:text-xl lg:text-2xl truncate">
                        {/* Una sola línea en md o mayor, dos líneas en sm o menor */}
                        <span className="hidden md:inline">
                            Corporación Universitaria Autónoma del Cauca
                        </span>
                        <span className="inline md:hidden">
                            Corporación Universitaria <br /> Autónoma del Cauca
                        </span>
                    </span>
                </div>
                {/* Botón cerrar sesión */}
                <button
                    onClick={onLogout}
                    className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded transition w-xs md:w-auto md:max-w-none mt-4 md:mt-0"
                >
                    Cerrar sesión
                </button>
            </div>
        </header>
    );
};

export default Header;