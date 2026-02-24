import { ImageResponse } from '@vercel/og';

export default async function handler() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#09090b',
          fontFamily: 'monospace',
        }}
      >
        {/* Redicle simulation */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0',
          }}
        >
          {/* Top guide marker */}
          <div
            style={{
              width: '2px',
              height: '24px',
              backgroundColor: '#dc2626',
              opacity: '0.6',
            }}
          />

          {/* Redicle box */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderTop: '1px solid #222228',
              borderBottom: '1px solid #222228',
              width: '900px',
              height: '160px',
            }}
          >
            <span style={{ color: '#e4e4e7', fontSize: '72px', fontWeight: 500, letterSpacing: '0.03em' }}>
              sti
            </span>
            <span style={{ color: '#dc2626', fontSize: '72px', fontWeight: 700, letterSpacing: '0.03em' }}>
              l
            </span>
            <span style={{ color: '#e4e4e7', fontSize: '72px', fontWeight: 500, letterSpacing: '0.03em' }}>
              lReading
            </span>
          </div>

          {/* Bottom guide marker */}
          <div
            style={{
              width: '2px',
              height: '24px',
              backgroundColor: '#dc2626',
              opacity: '0.6',
            }}
          />
        </div>

        {/* Tagline */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            marginTop: '48px',
            gap: '16px',
          }}
        >
          <span style={{ color: '#52525b', fontSize: '28px' }}>
            Speed read anything. Word by word.
          </span>
          <div style={{ display: 'flex', gap: '32px', color: '#3f3f46', fontSize: '20px' }}>
            <span>1. Paste markdown</span>
            <span style={{ color: '#222228' }}>|</span>
            <span>2. Hit play</span>
            <span style={{ color: '#222228' }}>|</span>
            <span>3. Read faster</span>
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    },
  );
}
