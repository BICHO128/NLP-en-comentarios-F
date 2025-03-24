import React from 'react';

interface HeaderProps {
    onProfileClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onProfileClick }) => {
    return (
        <header className="bg-blue-800 text-white">
            <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                <div className="flex items-center space-x-2">
                    <img
                        src="/imagenes/logo_autonoma.png"
                        alt="Logo Uniautonoma"
                        className="h-20"
                    />
                    <h1 className="text-2xl font-bold">Corporación Universitaria Autónoma del Cauca</h1>
                </div>
                <button onClick={onProfileClick} className="ml-4 p-2">
                    <img
                        src="/imagenes/perfil.png"
                        alt="Perfil"
                        className="h-14 w-14 rounded-full"
                    />
                </button>
            </div>
        </header>
    );
};

export default Header;