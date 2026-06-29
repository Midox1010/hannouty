import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen" style={{ background: '#f8faff' }}>

      {/* ==================== HERO ==================== */}
      <section style={{ background: '#1d4ed8', position: 'relative', overflow: 'hidden', padding: '56px 24px 64px' }}>
        <div style={{
          position: 'absolute', top: -80, right: -80,
          width: 320, height: 320, background: '#1e40af', borderRadius: '50%'
        }} />
        <div style={{
          position: 'absolute', bottom: -60, left: '8%',
          width: 180, height: 180, background: '#1e40af', borderRadius: '50%'
        }} />

        <div style={{ maxWidth: 720, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: 'rgba(251,191,36,0.2)',
            border: '0.5px solid rgba(251,191,36,0.5)',
            borderRadius: 20, padding: '4px 14px',
            fontSize: 12, color: '#fde68a', marginBottom: 20
          }}>
            ✦ Livraison en moins de 2h
          </div>

          <h1 style={{ fontSize: 42, fontWeight: 600, color: '#fff', lineHeight: 1.15, marginBottom: 14 }}>
            Vos courses,{' '}
            <span style={{ color: '#fbbf24' }}>livrées chez vous</span>
          </h1>

          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.75)', marginBottom: 28, lineHeight: 1.7, maxWidth: 480 }}>
            Épicerie du quotidien à prix réduits. Fidélité récompensée à chaque commande.
          </p>

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 40 }}>
            <Link href="/products" style={{
              background: '#fbbf24', color: '#1a1a1a',
              borderRadius: 8, padding: '12px 24px',
              fontWeight: 600, fontSize: 14, textDecoration: 'none',
              display: 'inline-flex', alignItems: 'center', gap: 6
            }}>
              Voir les produits →
            </Link>
            <Link href="/signup" style={{
              background: 'transparent', color: '#fff',
              border: '1px solid rgba(255,255,255,0.4)',
              borderRadius: 8, padding: '12px 24px',
              fontSize: 14, textDecoration: 'none'
            }}>
              Créer un compte
            </Link>
          </div>

          <div style={{
            display: 'flex', gap: 36,
            paddingTop: 28, borderTop: '0.5px solid rgba(255,255,255,0.15)'
          }}>
            {[
              { num: '2h', label: 'Livraison max' },
              { num: '15%', label: 'Réduction Platine' },
              { num: '4', label: 'Niveaux fidélité' },
            ].map((s) => (
              <div key={s.label}>
                <div style={{ fontSize: 22, fontWeight: 600, color: '#fbbf24' }}>{s.num}</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', marginTop: 3 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== FIDÉLITÉ ==================== */}
      <div style={{ maxWidth: 720, margin: '32px auto 0', padding: '0 24px' }}>
        <div style={{
          background: '#fff',
          border: '0.5px solid #bfdbfe',
          borderLeft: '3px solid #1d4ed8',
          borderRadius: 12, padding: '16px 20px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          gap: 16, flexWrap: 'wrap'
        }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#1e3a8a' }}>Programme de fidélité</div>
            <div style={{ fontSize: 12, color: '#3b82f6', marginTop: 2 }}>Économisez à chaque commande</div>
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {[
              { label: 'Bronze 0%', bg: '#fdf3e4', color: '#92400e' },
              { label: 'Argent 5%', bg: '#f0f0f0', color: '#555' },
              { label: 'Or 10%', bg: '#fef9c3', color: '#854d0e' },
              { label: 'Platine 15%', bg: '#ede9fe', color: '#5b21b6' },
            ].map((lvl) => (
              <span key={lvl.label} style={{
                background: lvl.bg, color: lvl.color,
                fontSize: 11, fontWeight: 600,
                padding: '3px 10px', borderRadius: 20
              }}>
                {lvl.label}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ==================== CATÉGORIES ==================== */}
      <section style={{ maxWidth: 720, margin: '40px auto 0', padding: '0 24px' }}>
        <p style={{ fontSize: 11, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 16 }}>
          Nos rayons
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
          {[
            { name: 'Huiles', emoji: '🫒' },
            { name: 'Sucres', emoji: '🧂' },
            { name: 'Laitiers', emoji: '🥛' },
            { name: 'Épices', emoji: '🌶️' },
          ].map((cat) => (
            <Link key={cat.name} href="/products" style={{
              background: '#fff', border: '0.5px solid #e5e7eb',
              borderRadius: 12, padding: '18px 10px', textAlign: 'center',
              textDecoration: 'none', display: 'block'
            }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>{cat.emoji}</div>
              <div style={{ fontSize: 12, color: '#374151', fontWeight: 500 }}>{cat.name}</div>
            </Link>
          ))}
        </div>
      </section>

      {/* ==================== AVANTAGES ==================== */}
      <section style={{ maxWidth: 720, margin: '40px auto 0', padding: '0 24px' }}>
        <p style={{ fontSize: 11, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 16 }}>
          Pourquoi Hannouty ?
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
          {[
            { icon: '🚚', title: 'Livraison rapide', desc: 'Reçu en moins de 2h dans votre ville' },
            { icon: '💰', title: 'Prix réduits', desc: 'Réductions automatiques selon votre niveau' },
            { icon: '📦', title: 'Large choix', desc: 'Huile, sucre, lait, épices et bien plus' },
          ].map((av) => (
            <div key={av.title} style={{
              background: '#fff', border: '0.5px solid #e5e7eb',
              borderRadius: 12, padding: '18px 14px'
            }}>
              <div style={{
                width: 34, height: 34, borderRadius: 8,
                background: '#dbeafe', display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontSize: 16, marginBottom: 12
              }}>
                {av.icon}
              </div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#111', marginBottom: 4 }}>{av.title}</div>
              <div style={{ fontSize: 12, color: '#6b7280', lineHeight: 1.5 }}>{av.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ==================== CTA ==================== */}
      <section style={{ maxWidth: 720, margin: '40px auto', padding: '0 24px' }}>
        <div style={{
          background: '#1d4ed8', borderRadius: 16,
          padding: '40px 32px', textAlign: 'center', color: '#fff'
        }}>
          <h2 style={{ fontSize: 22, fontWeight: 600, marginBottom: 8 }}>Prêt à commander ?</h2>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)', marginBottom: 24 }}>
            Inscription gratuite. Réductions dès la première commande.
          </p>
          <Link href="/signup" style={{
            background: '#fbbf24', color: '#1a1a1a',
            borderRadius: 8, padding: '12px 28px',
            fontWeight: 600, fontSize: 14, textDecoration: 'none',
            display: 'inline-block'
          }}>
            S'inscrire maintenant
          </Link>
        </div>
      </section>

      {/* ==================== FOOTER ==================== */}
      <footer style={{ borderTop: '0.5px solid #e5e7eb', padding: '24px', textAlign: 'center' }}>
        <p style={{ fontSize: 12, color: '#9ca3af' }}>
          © {new Date().getFullYear()} Hannouty. Tous droits réservés.
        </p>
      </footer>

    </div>
  )
}
