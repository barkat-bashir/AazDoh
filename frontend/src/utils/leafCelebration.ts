/**
 * Kashmiri Chinar Leaf & Golden Ember Celebration Burst
 * Lightweight Canvas Particle Animation for Habit Completion
 */

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  angle: number;
  angularVelocity: number;
  size: number;
  color: string;
  opacity: number;
  life: number;
  maxLife: number;
  type: 'leaf' | 'sparkle';
}

const CHINAR_COLORS = [
  '#C05330', // Chinar Rust
  '#E2953B', // Saffron Ember
  '#D8633F', // Chinar Rust Light
  '#FBBF24', // Golden Amber
  '#4ADE80', // Pine Emerald Spark
];

export const triggerLeafCelebration = (originX?: number, originY?: number) => {
  if (typeof window === 'undefined') return;

  // Check user prefers-reduced-motion
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return;
  }

  const canvas = document.createElement('canvas');
  canvas.style.position = 'fixed';
  canvas.style.inset = '0';
  canvas.style.width = '100vw';
  canvas.style.height = '100vh';
  canvas.style.pointerEvents = 'none';
  canvas.style.zIndex = '99999';
  document.body.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    canvas.remove();
    return;
  }

  const dpr = window.devicePixelRatio || 1;
  canvas.width = window.innerWidth * dpr;
  canvas.height = window.innerHeight * dpr;
  ctx.scale(dpr, dpr);

  const startX = originX !== undefined ? originX : window.innerWidth / 2;
  const startY = originY !== undefined ? originY : window.innerHeight / 2;

  const particles: Particle[] = [];
  const count = 36;

  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
    const speed = Math.random() * 6 + 3;
    const isLeaf = i % 2 === 0;

    particles.push({
      x: startX,
      y: startY,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - (isLeaf ? 2 : 1),
      angle: Math.random() * Math.PI * 2,
      angularVelocity: (Math.random() - 0.5) * 0.15,
      size: isLeaf ? Math.random() * 8 + 6 : Math.random() * 3 + 2,
      color: CHINAR_COLORS[Math.floor(Math.random() * CHINAR_COLORS.length)],
      opacity: 1,
      life: 0,
      maxLife: Math.random() * 40 + 45,
      type: isLeaf ? 'leaf' : 'sparkle',
    });
  }

  let animationFrameId: number;

  const drawLeaf = (p: Particle) => {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.angle);
    ctx.fillStyle = p.color;
    ctx.globalAlpha = p.opacity;

    // Stylized Leaf Shape
    ctx.beginPath();
    ctx.moveTo(0, -p.size);
    ctx.quadraticCurveTo(p.size, 0, 0, p.size);
    ctx.quadraticCurveTo(-p.size, 0, 0, -p.size);
    ctx.fill();

    ctx.restore();
  };

  const drawSparkle = (p: Particle) => {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.fillStyle = p.color;
    ctx.globalAlpha = p.opacity;
    ctx.beginPath();
    ctx.arc(0, 0, p.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  };

  const update = () => {
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

    let activeParticles = 0;

    for (const p of particles) {
      if (p.life < p.maxLife) {
        activeParticles++;
        p.life++;
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.12; // Gravity
        p.vx *= 0.98; // Air resistance
        p.angle += p.angularVelocity;
        p.opacity = Math.max(0, 1 - p.life / p.maxLife);

        if (p.type === 'leaf') {
          drawLeaf(p);
        } else {
          drawSparkle(p);
        }
      }
    }

    if (activeParticles > 0) {
      animationFrameId = requestAnimationFrame(update);
    } else {
      cancelAnimationFrame(animationFrameId);
      canvas.remove();
    }
  };

  animationFrameId = requestAnimationFrame(update);
};
