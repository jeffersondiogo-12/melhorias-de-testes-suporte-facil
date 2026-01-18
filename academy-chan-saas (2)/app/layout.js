import './globals.css';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata = { title: 'Academy-chan SaaS PRO', description: 'Sistema de Atendimento Multi-Empresa' }; 

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <div className="app-shell min-h-screen flex">
          <aside className="w-64 bg-white border-r p-6 flex flex-col gap-6">
            <div className="flex items-center gap-3">
              <img src="/images/logo.svg" alt="Logo" className="w-40 h-auto" />
            </div>
            <nav className="flex-1">
              {/* Placeholder for sidebar links - existing pages will render inside children */}
            </nav>
            <div className="text-xs text-gray-500">© Academy Chan</div>
          </aside>
          <main className="flex-1 bg-surface">{children}</main>
        </div>
      </body>
    </html>
  );
}