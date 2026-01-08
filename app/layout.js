import './globals.css';
import { Providers } from './providers';
import Shell from '@/components/layout/Shell';

export const metadata = {
  title: 'UDEC Gestión Integral',
  description: 'Sistema de Gestión Estudiantil',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>
        <Providers>
          <Shell>
            {children}
          </Shell>
        </Providers>
      </body>
    </html>
  );
}
