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
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body>
        <CartProvider>
          <Navbar />
          {children}
        </CartProvider>
      </body>
    </html>
  )
}
