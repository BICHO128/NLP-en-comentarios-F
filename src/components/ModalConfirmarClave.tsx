import { useState } from "react";

interface ModalConfirmarClaveProps {
    open: boolean;
    onClose: () => void;
    onConfirm: (clave: string) => Promise<boolean>;
}

export default function ModalConfirmarClave({ open, onClose, onConfirm }: ModalConfirmarClaveProps) {
    const [clave, setClave] = useState('');
    const [error, setError] = useState('');
    const [cargando, setCargando] = useState(false);

    if (!open) return null;

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setCargando(true);
        setError('');
        const ok = await onConfirm(clave);
        setCargando(false);
        if (!ok) setError('Contraseña incorrecta');
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl p-8 flex flex-col gap-4 items-center w-full max-w-md">
                <h2 className="text-2xl font-bold mb-2 text-blue-800">Verifica tu identidad</h2>
                <p className="text-gray-700 mb-3 text-center">Por seguridad, ingresa la contraseña de administrador para continuar.</p>
                <input
                    type="password"
                    className="px-4 py-2 rounded-lg border border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400 text-lg"
                    placeholder="Contraseña de administrador"
                    value={clave}
                    onChange={e => setClave(e.target.value)}
                    required
                    autoFocus
                />
                {error && <span className="text-red-600">{error}</span>}
                <div className="flex gap-4 mt-2">
                    <button
                        type="submit"
                        disabled={cargando}
                        className="bg-blue-700 text-white px-5 py-2 rounded-lg font-semibold hover:bg-blue-800 transition"
                    >
                        {cargando ? 'Verificando...' : 'Confirmar'}
                    </button>
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-5 py-2 rounded-lg border border-gray-300 text-gray-700 bg-gray-100 hover:bg-gray-200 transition"
                        disabled={cargando}
                    >
                        Cancelar
                    </button>
                </div>
            </form>
        </div>
    );
}
