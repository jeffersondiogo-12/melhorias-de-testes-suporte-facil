// components/ModuleBlocked.js
import { XCircle } from 'lucide-react';

const ModuleBlocked = ({ title, icon = <XCircle size={20} />, className = 'col-span-1' }) => (
    <div className={`bg-white rounded-xl shadow-card p-6 border-t-4 border-red-500 ${className}`}>
        <div className="flex items-center gap-2 text-red-500 mb-4">
            {icon}
            <h2 className="text-xl font-bold">{title}</h2>
        </div>
        <p className="text-sm text-gray-500">Acesso Negado. Este módulo está bloqueado pelas configurações do seu gestor.</p>
    </div>
);

export default ModuleBlocked;