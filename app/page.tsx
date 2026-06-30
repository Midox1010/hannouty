import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen" style={{ background: '#FAF8F4' }}>

      {/* ==================== HERO ==================== */}
      <section
        style={{
          position: 'relative',
          overflow: 'hidden',
          padding: '64px 24px 72px',
          background: 'linear-gradient(120deg, #0a3326 0%, #0E5C3F 55%, #137a52 100%)',
          backgroundSize: '200% 200%',
          animation: 'gradientShift 14s ease infinite',
        }}
      >
        {/* decorative blobs */}
        <div
          className="animate-float"
          style={{
            position: 'absolute', top: -100, right: -80,
            width: 360, height: 360, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(242,183,5,0.18) 0%, transparent 70%)',
          }}
        />
        <div
          style={{
            position: 'absolute', bottom: -80, left: '6%',
            width: 220, height: 220, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%)',
            animation: 'float 5s ease-in-out infinite',
            animationDelay: '1s',
          }}
        />

        <div style={{ maxWidth: 760, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div
            className="animate-fade-up"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: 'rgba(242,183,5,0.15)',
              border: '1px solid rgba(242,183,5,0.4)',
              borderRadius: 999, padding: '5px 14px',
              fontSize: 12, fontWeight: 600, color: '#f7cc3a', marginBottom: 22,
            }}
          >
            ✦ Livraison en moins de 2h
          </div>

          <h1
            className="animate-fade-up delay-1"
            style={{ fontSize: 'clamp(32px,5vw,46px)', fontWeight: 800, color: '#fff', lineHeight: 1.14, marginBottom: 16, letterSpacing: '-0.02em' }}
          >
            Vos courses,{' '}
            <span style={{
              background: 'linear-gradient(135deg,#f7cc3a,#f2b705)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
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
            <Link
              href="/products"
              style={{
                background: 'linear-gradient(135deg,#f7cc3a,#f2b705)',
                color: '#16201c',
                borderRadius: 12, padding: '13px 26px',
                fontWeight: 700, fontSize: 14.5, textDecoration: 'none',
                display: 'inline-flex', alignItems: 'center', gap: 6,
                boxShadow: '0 6px 22px rgba(242,183,5,0.35)',
                transition: 'transform .2s ease, box-shadow .2s ease',
              }}
            >
              Voir les produits →
            </Link>
            <Link
              href="/signup"
              style={{
                background: 'rgba(255,255,255,0.06)',
                color: '#fff',
                border: '1.5px solid rgba(255,255,255,0.3)',
                borderRadius: 12, padding: '13px 26px',
                fontSize: 14.5, fontWeight: 600, textDecoration: 'none',
                backdropFilter: 'blur(6px)',
                transition: 'background .2s ease, border-color .2s ease',
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
                <div style={{ fontSize: 24, fontWeight: 800, color: '#f7cc3a', letterSpacing: '-0.02em' }}>{s.num}</div>
                <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.6)', marginTop: 3 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== FIDÉLITÉ ==================== */}
      <div className="animate-fade-up" style={{ maxWidth: 760, margin: '-28px auto 0', padding: '0 24px', position: 'relative', zIndex: 2 }}>
        <div
          style={{
            background: '#fff',
            border: '1px solid #e9e4d8',
            borderRadius: 18, padding: '18px 22px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            gap: 16, flexWrap: 'wrap',
            boxShadow: '0 12px 32px rgba(14,92,63,0.1)',
          }}
        >
          <div>
            <div style={{ fontSize: 13.5, fontWeight: 700, color: '#0a3326' }}>Programme de fidélité</div>
            <div style={{ fontSize: 12, color: '#5b665f', marginTop: 2 }}>Économisez à chaque commande</div>
          </div>
          <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
            {[
              { label: 'Bronze 0%', bg: 'linear-gradient(135deg,#e3c19a,#c98a4f)', color: '#fff' },
              { label: 'Argent 5%', bg: 'linear-gradient(135deg,#d4d5d8,#9b9da1)', color: '#fff' },
              { label: 'Or 10%', bg: 'linear-gradient(135deg,#f7cc3a,#f2b705)', color: '#5a3d00' },
              { label: 'Platine 15%', bg: 'linear-gradient(135deg,#ece9e4,#b9b9bb)', color: '#2b2b2b' },
            ].map((lvl) => (
              <span key={lvl.label} style={{
                background: lvl.bg, color: lvl.color,
                fontSize: 11, fontWeight: 700,
                padding: '4px 12px', borderRadius: 999,
                boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
              }}>
                {lvl.label}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ==================== CATÉGORIES ==================== */}
      <section style={{ maxWidth: 760, margin: '48px auto 0', padding: '0 24px' }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: '#94a39a', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 18 }}>
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
              className="animate-fade-up"
              style={{
                animationDelay: `${i * 0.06}s`,
                background: '#fff', border: '1px solid #ece8e0',
                borderRadius: 16, padding: '20px 10px', textAlign: 'center',
                textDecoration: 'none', display: 'block',
                transition: 'transform .25s var(--ease), box-shadow .25s ease, border-color .25s ease',
              }}
            >
              <div style={{ fontSize: 30, marginBottom: 10 }}>{cat.emoji}</div>
              <div style={{ fontSize: 12.5, color: '#16201c', fontWeight: 600 }}>{cat.name}</div>
            </Link>
          ))}
        </div>
      </section>

      {/* ==================== AVANTAGES ==================== */}
      <section style={{ maxWidth: 760, margin: '48px auto 0', padding: '0 24px' }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: '#94a39a', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 18 }}>
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
              className="animate-fade-up"
              style={{
                animationDelay: `${i * 0.08}s`,
                background: '#fff', border: '1px solid #ece8e0',
                borderRadius: 16, padding: '20px 16px',
                transition: 'transform .25s var(--ease), box-shadow .25s ease',
              }}
            >
              <div style={{
                width: 38, height: 38, borderRadius: 11,
                background: 'linear-gradient(135deg,#e3f5ec,#cdeede)',
                display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontSize: 17, marginBottom: 14,
              }}>
                {av.icon}
              </div>
              <div style={{ fontSize: 13.5, fontWeight: 700, color: '#16201c', marginBottom: 5 }}>{av.title}</div>
              <div style={{ fontSize: 12, color: '#5b665f', lineHeight: 1.55 }}>{av.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ==================== CTA ==================== */}
      <section style={{ maxWidth: 760, margin: '48px auto', padding: '0 24px' }}>
        <div
          style={{
            background: 'linear-gradient(120deg, #0a3326 0%, #0E5C3F 55%, #137a52 100%)',
            backgroundSize: '200% 200%',
            animation: 'gradientShift 14s ease infinite',
            borderRadius: 22, padding: '46px 32px', textAlign: 'center', color: '#fff',
            position: 'relative', overflow: 'hidden',
          }}
        >
          <div
            style={{
              position: 'absolute', top: -60, right: -40,
              width: 200, height: 200, borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(242,183,5,0.16) 0%, transparent 70%)',
            }}
          />
          <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 9, position: 'relative' }}>Prêt à commander ?</h2>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.72)', marginBottom: 26, position: 'relative' }}>
            Inscription gratuite. Réductions dès la première commande.
          </p>
          <Link
            href="/signup"
            style={{
              background: 'linear-gradient(135deg,#f7cc3a,#f2b705)',
              color: '#16201c',
              borderRadius: 12, padding: '13px 30px',
              fontWeight: 700, fontSize: 14.5, textDecoration: 'none',
              display: 'inline-block', position: 'relative',
              boxShadow: '0 8px 24px rgba(242,183,5,0.4)',
            }}
          >
            S'inscrire maintenant
          </Link>
        </div>
      </section>

      {/* ==================== FOOTER ==================== */}
      <footer style={{ borderTop: '1px solid #ece8e0', padding: '26px', textAlign: 'center' }}>
        <p style={{ fontSize: 12, color: '#94a39a' }}>
          © {new Date().getFullYear()} Hannouty. Tous droits réservés.
        </p>
      </footer>

    </div>
  )
}
