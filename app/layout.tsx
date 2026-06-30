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
              async function checkVersion() {
                try {
                  const res = await fetch('/version', { cache: 'no-store' });
                  const data = await res.json();
                  const stored = localStorage.getItem('app_version');
                  if (stored && stored !== String(data.version)) {
                    localStorage.setItem('app_version', String(data.version));
                    window.location.reload();
                  } else if (!stored) {
                    localStorage.setItem('app_version', String(data.version));
                  }
                } catch (e) {}
              }
              checkVersion();
              document.addEventListener('visibilitychange', function() {
                if (document.visibilityState === 'visible') checkVersion();
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