import React, { useEffect, useRef } from 'react';

interface LeafParticle {
  x: number;
  y: number;
  z: number;
  size: number;
  rotationX: number;
  rotationY: number;
  rotationZ: number;
  speedX: number;
  speedY: number;
  speedRotationX: number;
  speedRotationY: number;
  speedRotationZ: number;
  color: string;
  opacity: number;
  swayOffset: number;
}

export const ChinarLeavesCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    // Chinar Autumn Kashmir Palette
    const leafColors = [
      '#C05330', // Chinar Rust
      '#D46440', // Bright Terracotta
      '#E2953B', // Saffron Amber
      '#8C3018', // Deep Mahogany Chinar
      '#B04626', // Burnt Orange
      '#9E2A2B', // Crimson Ember
    ];

    const leafCount = Math.min(24, Math.floor(width / 60));
    const leaves: LeafParticle[] = [];

    const createLeaf = (initialY = -40): LeafParticle => {
      return {
        x: Math.random() * width,
        y: initialY,
        z: Math.random() * 0.7 + 0.3, // Depth scale
        size: Math.random() * 16 + 14,
        rotationX: Math.random() * Math.PI * 2,
        rotationY: Math.random() * Math.PI * 2,
        rotationZ: Math.random() * Math.PI * 2,
        speedX: (Math.random() - 0.4) * 0.8,
        speedY: Math.random() * 0.7 + 0.5,
        speedRotationX: (Math.random() - 0.5) * 0.02,
        speedRotationY: (Math.random() - 0.5) * 0.03,
        speedRotationZ: (Math.random() - 0.5) * 0.02,
        color: leafColors[Math.floor(Math.random() * leafColors.length)],
        opacity: Math.random() * 0.45 + 0.25,
        swayOffset: Math.random() * 100,
      };
    };

    // Initialize leaves spread vertically
    for (let i = 0; i < leafCount; i++) {
      leaves.push(createLeaf(Math.random() * height));
    }

    // Function to draw authentic 5-lobe Chinar leaf path with 3D projection
    const drawChinarLeaf = (
      context: CanvasRenderingContext2D,
      size: number,
      color: string,
      opacity: number
    ) => {
      context.beginPath();
      context.fillStyle = color;
      context.globalAlpha = opacity;

      // Authentic Chinar silhouette path (5 serrated lobes with stalk)
      context.moveTo(0, size * 0.8); // Stem base
      context.lineTo(0, size * 0.4);

      // Bottom Left Lobe
      context.bezierCurveTo(-size * 0.4, size * 0.3, -size * 0.7, size * 0.2, -size * 0.6, 0);
      context.lineTo(-size * 0.4, -size * 0.1);

      // Top Left Lobe
      context.bezierCurveTo(-size * 0.7, -size * 0.3, -size * 0.6, -size * 0.7, -size * 0.3, -size * 0.5);
      context.lineTo(-size * 0.15, -size * 0.35);

      // Central Main Lobe
      context.bezierCurveTo(-size * 0.2, -size * 0.8, 0, -size * 1.0, 0, -size * 1.0);
      context.bezierCurveTo(0, -size * 1.0, size * 0.2, -size * 0.8, size * 0.15, -size * 0.35);

      // Top Right Lobe
      context.lineTo(size * 0.3, -size * 0.5);
      context.bezierCurveTo(size * 0.6, -size * 0.7, size * 0.7, -size * 0.3, size * 0.4, -size * 0.1);

      // Bottom Right Lobe
      context.lineTo(size * 0.6, 0);
      context.bezierCurveTo(size * 0.7, size * 0.2, size * 0.4, size * 0.3, 0, size * 0.4);

      context.closePath();
      context.fill();

      // Subtle main vein line
      context.beginPath();
      context.strokeStyle = 'rgba(255, 230, 200, 0.25)';
      context.lineWidth = 1;
      context.moveTo(0, size * 0.7);
      context.lineTo(0, -size * 0.7);
      context.stroke();
    };

    let tick = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      tick += 0.015;

      for (let i = 0; i < leaves.length; i++) {
        const leaf = leaves[i];

        // 3D physics update
        leaf.y += leaf.speedY * leaf.z;
        leaf.x += leaf.speedX + Math.sin(tick + leaf.swayOffset) * 0.6 * leaf.z;
        leaf.rotationX += leaf.speedRotationX;
        leaf.rotationY += leaf.speedRotationY;
        leaf.rotationZ += leaf.speedRotationZ + Math.sin(tick * 0.5) * 0.005;

        // Reset if drifted beyond canvas
        if (leaf.y > height + 40) {
          leaves[i] = createLeaf(-30);
        }
        if (leaf.x < -40) leaf.x = width + 30;
        if (leaf.x > width + 40) leaf.x = -30;

        // 3D Transformation
        ctx.save();
        ctx.translate(leaf.x, leaf.y);

        // 3D Scale and Perspective Squash
        const scaleX = Math.cos(leaf.rotationY) * leaf.z;
        const scaleY = Math.cos(leaf.rotationX) * leaf.z;

        ctx.rotate(leaf.rotationZ);
        ctx.scale(scaleX, scaleY);

        drawChinarLeaf(ctx, leaf.size, leaf.color, leaf.opacity * leaf.z);
        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 1,
        opacity: 0.85,
      }}
    />
  );
};
