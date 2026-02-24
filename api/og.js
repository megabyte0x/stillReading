import { ImageResponse } from '@vercel/og';
import React from 'react';

export const config = { runtime: 'edge' };

export default function handler() {
  const h = React.createElement;

  return new ImageResponse(
    h('div', {
      style: {
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#09090b',
        fontFamily: 'monospace',
      },
    },
      h('div', {
        style: { display: 'flex', flexDirection: 'column', alignItems: 'center' },
      },
        h('div', {
          style: { width: '2px', height: '24px', backgroundColor: '#dc2626', opacity: 0.6 },
        }),
        h('div', {
          style: {
            display: 'flex',
            alignItems: 'center',
            borderTop: '1px solid #222228',
            borderBottom: '1px solid #222228',
            width: '900px',
            height: '160px',
          },
        },
          // Left half: "sti" right-aligned so it ends at center
          h('div', { style: { flex: 1, display: 'flex', justifyContent: 'flex-end' } },
            h('span', { style: { color: '#e4e4e7', fontSize: 72, fontWeight: 500, letterSpacing: '0.03em' } }, 'sti'),
          ),
          // Pivot: "l" sits at exact center
          h('span', { style: { color: '#dc2626', fontSize: 72, fontWeight: 700, letterSpacing: '0.03em' } }, 'l'),
          // Right half: "lReading" left-aligned so it starts after center
          h('div', { style: { flex: 1, display: 'flex', justifyContent: 'flex-start' } },
            h('span', { style: { color: '#e4e4e7', fontSize: 72, fontWeight: 500, letterSpacing: '0.03em' } }, 'lReading'),
          ),
        ),
        h('div', {
          style: { width: '2px', height: '24px', backgroundColor: '#dc2626', opacity: 0.6 },
        }),
      ),
      h('div', {
        style: { display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 48, gap: 16 },
      },
        h('span', { style: { color: '#52525b', fontSize: 28 } }, 'Speed read anything. Word by word.'),
        h('div', { style: { display: 'flex', gap: 32, color: '#3f3f46', fontSize: 20 } },
          h('span', null, '1. Paste markdown'),
          h('span', { style: { color: '#222228' } }, '|'),
          h('span', null, '2. Hit play'),
          h('span', { style: { color: '#222228' } }, '|'),
          h('span', null, '3. Read faster'),
        ),
      ),
    ),
    { width: 1200, height: 630 },
  );
}
