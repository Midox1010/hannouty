import { NextResponse } from 'next/server';

// Calculé UNE SEULE FOIS au démarrage du serveur (donc à chaque déploiement)
const BUILD_VERSION = Date.now();

export async function GET() {
  return NextResponse.json(
    { version: BUILD_VERSION },
    {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    }
  );
}