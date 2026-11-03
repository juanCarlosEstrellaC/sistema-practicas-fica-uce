import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { ProveedorAutenticacion } from '@/lib/contextos/contexto-autenticacion'
import { ProveedorTema } from '@/lib/contextos/contexto-tema'
import { Toaster } from 'sonner'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'Sistema de Gestión de Prácticas - FICA UCE',
  description: 'Sistema de Gestión de Prácticas - Facultad de Ingeniería y Ciencias Aplicadas, Universidad Central del Ecuador',
  generator: 'Next.js',
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0f0f0f' },
  ],
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className="font-sans antialiased" suppressHydrationWarning>
        <ProveedorTema>
          <ProveedorAutenticacion>
            {children}
          </ProveedorAutenticacion>
          <Toaster richColors position="top-right" />
        </ProveedorTema>
      </body>
    </html>
  )
}
