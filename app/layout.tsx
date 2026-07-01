import type { Metadata } from 'next'
import './globals.css'
import Navbar from './components/Navbar'
import { CartProvider } from './context/CartContext'

export const metadata: Metadata = {
  title: 'Hannouty - Supermarché en ligne',
  description: 'Vos produits alimentaires livrés à domicile',
  icons: {
    icon: '/logo.png',
    shortcut: '/logo.png',
    apple: '/logo.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Hannouty',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.addEventListener('error', function(e) {
                if (e.message && (e.message.includes('Loading chunk') || e.message.includes('Failed to fetch'))) {
                  window.location.href = window.location.href;
                }
              });
              window.addEventListener('unhandledrejection', function(e) {
                var msg = e.reason && e.reason.message;
                if (msg && (msg.includes('Loading chunk') || msg.includes('Failed to fetch') || msg.includes('dynamically imported module'))) {
                  window.location.href = window.location.href;
                }
              });
            `,
          }}
        />
        <CartProvider>
          <Navbar />
          {children}
        </CartProvider>
      </body>
    </html>
  )
}