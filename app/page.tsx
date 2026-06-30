import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen" style={{ background: 'var(--color-bg)' }}>

      {/* ==================== HERO ==================== */}
      <section
        style={{
          position: 'relative',
          overflow: 'hidden',
          padding: '64px 24px 72px',
          background: 'linear-gradient(135deg, var(--color-brand-green) 0%, var(--color-brand-green-mid) 100%)',
        }}
      >
        {/* decorative blobs */}
        <div
          className="animate-float"
          style={{
            position: 'absolute', top: -100, right: -80,
            width: 360, height: 360, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(244,197,66,0.18) 0%, transparent 70%)',
          }}
        />
        <div
          style={{
            position: 'absolute', bottom: -80, left: '6%',
            width: 220, height: 220, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%)',
          }}
        />

        <div style={{ maxWidth: 760, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div
            className="animate-fade-up"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: 'rgba(244,197,66,0.15)',
              border: '1px solid rgba(244,197,66,0.4)',
              borderRadius: 999, padding: '5px 14px',
              fontSize: 12, fontWeight: 600, color: 'var(--color-brand-gold)', marginBottom: 22,
            }}
          >
            ✦ Livraison en moins de 2h
          </div>

          <h1
            className="animate-fade-up delay-1"
            style={{ fontSize: 'clamp(32px,5vw,46px)', fontWeight: 800, color: '#fff', lineHeight: 1.14, marginBottom: 16, letterSpacing: '-0.02em' }}
          >
            Vos courses,{' '}
            <span style={{ color: 'var(--color-brand-gold)' }}>
              livrées chez vous
            </span>
          </h1>

          <p
            className="animate-fade-up delay-2"
            style={{ fontSize: 16, color: 'rgba(255,255,255,0.78)', marginBottom: 30, lineHeight: 1.7, maxWidth: 480 }}
          >
            Épicerie du quotidien à prix réduits. Fidélité récompensée à chaque commande.
          </p>

          <div className="animate-fade-up delay-3" style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 44 }}>
            <Link href="/products" className="btn btn-gold btn-lg">
              Voir les produits →
            </Link>
            <Link
              href="/signup"
              className="btn btn-lg"
              style={{
                background: 'rgba(255,255,255,0.08)',
                color: '#fff',
                border: '1.5px solid rgba(255,255,255,0.3)',
              }}
            >
              Créer un compte
            </Link>
          </div>

          <div
            className="animate-fade-up delay-4"
            style={{
              display: 'flex', gap: 40,
              paddingTop: 28, borderTop: '1px solid rgba(255,255,255,0.12)',
            }}
          >
            {[
              { num: '2h', label: 'Livraison max' },
              { num: '15%', label: 'Réduction Platine' },
              { num: '4', label: 'Niveaux fidélité' },
            ].map((s) => (
              <div key={s.label}>
                <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--color-brand-gold)', letterSpacing: '-0.02em' }}>{s.num}</div>
                <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.6)', marginTop: 3 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== FIDÉLITÉ ==================== */}
      <div className="animate-fade-up" style={{ maxWidth: 760, margin: '-28px auto 0', padding: '0 24px', position: 'relative', zIndex: 2 }}>
        <div
          className="card"
          style={{
            padding: '18px 22px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            gap: 16, flexWrap: 'wrap',
          }}
        >
          <div>
            <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--color-text-primary)' }}>Programme de fidélité</div>
            <div className="text-muted" style={{ fontSize: 12, marginTop: 2 }}>Économisez à chaque commande</div>
          </div>
          <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
            <span className="badge badge-bronze">Bronze 0%</span>
            <span className="badge badge-silver">Argent 5%</span>
            <span className="badge badge-gold">Or 10%</span>
            <span className="badge badge-platinum">Platine 15%</span>
          </div>
        </div>
      </div>

      {/* ==================== CATÉGORIES ==================== */}
      <section style={{ maxWidth: 760, margin: '48px auto 0', padding: '0 24px' }}>
        <p className="text-label" style={{ marginBottom: 18 }}>
          Nos rayons
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
          {[
            { name: 'Huiles', emoji: '🫒' },
            { name: 'Sucres', emoji: '🧂' },
            { name: 'Laitiers', emoji: '🥛' },
            { name: 'Épices', emoji: '🌶️' },
          ].map((cat, i) => (
            <Link
              key={cat.name}
              href="/products"
              className="card animate-fade-up"
              style={{
                animationDelay: `${i * 0.06}s`,
                padding: '20px 10px', textAlign: 'center',
                textDecoration: 'none', display: 'block',
              }}
            >
              <div style={{ fontSize: 30, marginBottom: 10 }}>{cat.emoji}</div>
              <div style={{ fontSize: 12.5, color: 'var(--color-text-primary)', fontWeight: 600 }}>{cat.name}</div>
            </Link>
          ))}
        </div>
      </section>

      {/* ==================== AVANTAGES ==================== */}
      <section style={{ maxWidth: 760, margin: '48px auto 0', padding: '0 24px' }}>
        <p className="text-label" style={{ marginBottom: 18 }}>
          Pourquoi Hannouty ?
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          {[
            { icon: '🚚', title: 'Livraison rapide', desc: 'Reçu en moins de 2h dans votre ville' },
            { icon: '💰', title: 'Prix réduits', desc: 'Réductions automatiques selon votre niveau' },
            { icon: '📦', title: 'Large choix', desc: 'Huile, sucre, lait, épices et bien plus' },
          ].map((av, i) => (
            <div
              key={av.title}
              className="card animate-fade-up"
              style={{
                animationDelay: `${i * 0.08}s`,
                padding: '20px 16px',
              }}
            >
              <div className="stat-icon" style={{
                background: 'var(--color-brand-green-pale)', color: 'var(--color-brand-green)',
                width: 38, height: 38, fontSize: 17, marginBottom: 14,
              }}>
                {av.icon}
              </div>
              <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: 5 }}>{av.title}</div>
              <div className="text-muted" style={{ fontSize: 12, lineHeight: 1.55 }}>{av.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ==================== CTA ==================== */}
      <section style={{ maxWidth: 760, margin: '48px auto', padding: '0 24px' }}>
        <div
          style={{
            background: 'linear-gradient(135deg, var(--color-brand-green) 0%, var(--color-brand-green-mid) 100%)',
            borderRadius: 'var(--radius-lg)', padding: '46px 32px', textAlign: 'center', color: '#fff',
            position: 'relative', overflow: 'hidden',
          }}
        >
          <div
            style={{
              position: 'absolute', top: -60, right: -40,
              width: 200, height: 200, borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(244,197,66,0.16) 0%, transparent 70%)',
            }}
          />
          <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 9, position: 'relative', color: '#fff' }}>Prêt à commander ?</h2>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.72)', marginBottom: 26, position: 'relative' }}>
            Inscription gratuite. Réductions dès la première commande.
          </p>
          <Link href="/signup" className="btn btn-gold btn-lg" style={{ position: 'relative' }}>
            S'inscrire maintenant
          </Link>
        </div>
      </section>

      {/* ==================== FOOTER ==================== */}
      <footer style={{ borderTop: '1px solid var(--color-border)', padding: '26px', textAlign: 'center' }}>
        <p className="text-muted" style={{ fontSize: 12 }}>
          © {new Date().getFullYear()} Hannouty. Tous droits réservés.
        </p>
      </footer>

    </div>
  )
}