import React, { useEffect, useRef, useState } from 'react';

interface NodePoint {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  id: string;
  pulsePhase: number;
  pulseSpeed: number;
}

export const HeroVisualMesh: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);
  const [activeQuorumCount, setActiveQuorumCount] = useState(7);
  const [scanStatus, setScanStatus] = useState('SYNCED');

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 640);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };
    window.addEventListener('resize', handleResize);

    // Initialize decentralized validator nodes
    const nodeCount = Math.max(14, Math.floor(width / 75));
    const nodes: NodePoint[] = [];

    const nodeIds = [
      'GEN-0x8f2a', 'VAL-0x12b4', 'L1-0x7e44', 'VAL-0x99a0',
      'VAL-0x3344', 'GEN-0x5501', 'VAL-0x4488', 'CONS-0x6109',
      'GEN-0x2a11', 'VAL-0x9e88', 'L1-0x3d01', 'VAL-0xfa88'
    ];

    for (let i = 0; i < nodeCount; i++) {
      nodes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        radius: Math.random() > 0.85 ? 3 : 2,
        id: nodeIds[i % nodeIds.length] || `VAL-0x${Math.floor(Math.random() * 0xffff).toString(16)}`,
        pulsePhase: Math.random() * Math.PI * 2,
        pulseSpeed: 0.02 + Math.random() * 0.03,
      });
    }

    let scanY = 0;
    const scanSpeed = 1.2;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // 1. Sweeping horizontal laser scanline (Simulating GenLayer consensus prober)
      scanY += scanSpeed;
      if (scanY > height) scanY = 0;

      const scanGrad = ctx.createLinearGradient(0, scanY - 30, 0, scanY);
      scanGrad.addColorStop(0, 'rgba(0, 229, 160, 0)');
      scanGrad.addColorStop(0.8, 'rgba(0, 229, 160, 0.04)');
      scanGrad.addColorStop(1, 'rgba(0, 229, 160, 0.18)');

      ctx.fillStyle = scanGrad;
      ctx.fillRect(0, scanY - 30, width, 30);

      ctx.beginPath();
      ctx.moveTo(0, scanY);
      ctx.lineTo(width, scanY);
      ctx.strokeStyle = 'rgba(0, 229, 160, 0.35)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 6]);
      ctx.stroke();
      ctx.setLineDash([]);

      // 2. Inter-node consensus connection lines
      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];
        a.x += a.vx;
        a.y += a.vy;

        // Bounce on boundary
        if (a.x < 10 || a.x > width - 10) a.vx *= -1;
        if (a.y < 10 || a.y > height - 10) a.vy *= -1;

        a.pulsePhase += a.pulseSpeed;

        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          const maxDist = 140;
          if (dist < maxDist) {
            const alpha = (1 - dist / maxDist) * 0.22;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(0, 229, 160, ${alpha})`;
            ctx.lineWidth = 0.75;
            ctx.stroke();

            // Intermittent data packets traveling along connection
            const t = (Math.sin(a.pulsePhase + j) + 1) / 2;
            const px = a.x + (b.x - a.x) * t;
            const py = a.y + (b.y - a.y) * t;

            ctx.fillStyle = 'rgba(0, 229, 160, 0.6)';
            ctx.fillRect(px - 1, py - 1, 2, 2);
          }
        }

        // Connection to mouse position if nearby
        if (mousePos) {
          const mdx = a.x - mousePos.x;
          const mdy = a.y - mousePos.y;
          const mDist = Math.sqrt(mdx * mdx + mdy * mdy);
          if (mDist < 160) {
            const mAlpha = (1 - mDist / 160) * 0.45;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(mousePos.x, mousePos.y);
            ctx.strokeStyle = `rgba(0, 229, 160, ${mAlpha})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }

        // Draw node dot
        const glow = Math.sin(a.pulsePhase) * 0.4 + 0.6;
        ctx.beginPath();
        ctx.arc(a.x, a.y, a.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 229, 160, ${glow})`;
        ctx.fill();

        // Node ID label (visible on prominent nodes)
        if (a.radius > 2) {
          ctx.font = '9px JetBrains Mono, monospace';
          ctx.fillStyle = 'rgba(161, 161, 170, 0.45)';
          ctx.fillText(a.id, a.x + 6, a.y + 3);
        }
      }

      // 3. Ambient Telemetry Crosshairs in corners
      ctx.strokeStyle = 'rgba(36, 36, 40, 0.8)';
      ctx.lineWidth = 1;

      // Crosshairs
      const crossSize = 8;
      const coords = [
        { x: 30, y: 30 },
        { x: width - 30, y: 30 },
        { x: 30, y: height - 30 },
        { x: width - 30, y: height - 30 },
      ];

      coords.forEach(({ x, y }) => {
        ctx.beginPath();
        ctx.moveTo(x - crossSize, y);
        ctx.lineTo(x + crossSize, y);
        ctx.moveTo(x, y - crossSize);
        ctx.lineTo(x, y + crossSize);
        ctx.stroke();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [mousePos]);

  // Periodic simulated validator quorum cycle
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveQuorumCount(Math.floor(Math.random() * 3) + 7);
      setScanStatus((prev) => (prev === 'SYNCED' ? 'EVALUATING' : 'SYNCED'));
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const handleMouseLeave = () => {
    setMousePos(null);
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="absolute inset-0 z-0 select-none pointer-events-auto overflow-hidden bg-[#0A0A0B]"
    >
      {/* High-fidelity background still image asset */}
      <img
        src="/hero_terminal_mesh.jpg"
        alt="StakedTakes GenLayer validator consensus telemetry grid"
        referrerPolicy="no-referrer"
        className="w-full h-full object-cover object-center opacity-40 mix-blend-luminosity filter contrast-125 scale-[1.02] transition-transform duration-1000 ease-out"
      />

      {/* Interactive Canvas Consensus Animation Layer */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
      />

      {/* Measured Dark Scrim to guarantee WCAG AA contrast (≥ 4.5:1) */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0B] via-[#0A0A0B]/80 to-[#0A0A0B]/55 pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(#242428_1px,transparent_1px)] [background-size:24px_24px] opacity-20 pointer-events-none" />

      {/* Top right live oracle node HUD badge */}
      <div className="absolute top-6 right-6 z-10 hidden lg:flex items-center gap-3 bg-[#111113]/90 border border-[#242428] px-3 py-1.5 text-[11px] font-mono backdrop-blur-sm pointer-events-none">
        <span className="w-1.5 h-1.5 bg-[#00E5A0]" />
        <span className="text-[#A1A1AA]">GENLAYER ORACLE:</span>
        <span className="text-[#00E5A0] font-bold tracking-wider">{scanStatus}</span>
        <span className="text-[#71717A]" aria-hidden="true">·</span>
        <span className="text-[#A1A1AA] tabular-nums">{activeQuorumCount}/7 NODES</span>
      </div>

      {/* Subtle bottom-left coordinate indicator */}
      <div className="absolute bottom-16 left-6 z-10 hidden sm:flex items-center gap-2 text-[10px] font-mono text-[#71717A] pointer-events-none">
        <span>GRID: 0x9F41</span>
        <span aria-hidden="true">·</span>
        <span>LATENCY: 18ms</span>
        <span aria-hidden="true">·</span>
        <span>NON-CUSTODIAL ESCROW ACTIVE</span>
      </div>
    </div>
  );
};
