// ═══════════════════════════════════════════
// TACTICAL FIELD RENDERER — Holographic HUD Radar
// ═══════════════════════════════════════════

export class TacticalField {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
    this.fieldPositions = [];
    this.animFrame = null;
    this.pulsePhase = 0;
    this.radarAngle = 0;
    
    this.resizeBound = this.resize.bind(this);
    window.addEventListener('resize', this.resizeBound);
    this.resize();
  }

  destroy() {
    if (this.animFrame) cancelAnimationFrame(this.animFrame);
    window.removeEventListener('resize', this.resizeBound);
  }

  resize() {
    const container = this.canvas.parentElement;
    if (!container) return;
    const size = Math.max(100, Math.min(container.clientWidth - 20, container.clientHeight - 20, 450));
    this.canvas.width = size;
    this.canvas.height = size;
    this.cx = size / 2;
    this.cy = size / 2;
    this.radius = size * 0.44;
    this.draw();
  }

  draw() {
    const { ctx, cx, cy, radius } = this;
    if (radius < 10) return; 
    const w = this.canvas.width;
    const h = this.canvas.height;
    ctx.clearRect(0, 0, w, h);

    // Color Palette: Cinematic Neon HUD
    const colors = {
      outfield: 'rgba(3, 7, 18, 0.9)', // Deep space
      boundary: 'rgba(14, 165, 233, 0.4)',
      grid: 'rgba(14, 165, 233, 0.08)',
      inner: 'rgba(14, 165, 233, 0.25)',
      pitch: 'rgba(16, 185, 129, 0.1)',
      pitchBorder: 'rgba(16, 185, 129, 0.4)',
      text: 'rgba(14, 165, 233, 0.5)',
      textHigh: 'rgba(248, 250, 252, 0.9)',
      crease: 'rgba(16, 185, 129, 0.6)',
      dotGlow: 'rgba(56, 189, 248, 0.5)',
      dot: '#bae6fd',
      dotBorder: '#38bdf8',
      danger: 'rgba(244, 63, 94, 0.15)'
    };

    // Advanced glowing backdrop
    const boundaryGrad = ctx.createRadialGradient(cx, cy, radius * 0.7, cx, cy, radius * 1.2);
    boundaryGrad.addColorStop(0, 'transparent');
    boundaryGrad.addColorStop(0.8, colors.grid);
    boundaryGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = boundaryGrad;
    ctx.fillRect(0, 0, w, h);

    // Outfield Base
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fillStyle = colors.outfield;
    ctx.fill();
    ctx.strokeStyle = colors.boundary;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Holographic Grid Overlay
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.clip();
    ctx.strokeStyle = colors.grid;
    ctx.lineWidth = 0.5;
    for (let i = 0; i < w; i += 15) {
      ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, h); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(w, i); ctx.stroke();
    }
    ctx.restore();

    // 30-yard inner circle
    const innerR = radius * 0.55;
    ctx.beginPath();
    ctx.arc(cx, cy, innerR, 0, Math.PI * 2);
    ctx.strokeStyle = colors.inner;
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 5]);
    ctx.stroke();
    ctx.setLineDash([]);

    // Pitch
    const pitchW = radius * 0.07;
    const pitchH = radius * 0.38;
    ctx.fillStyle = colors.pitch;
    ctx.fillRect(cx - pitchW / 2, cy - pitchH / 2, pitchW, pitchH);
    ctx.strokeStyle = colors.pitchBorder;
    ctx.lineWidth = 1;
    ctx.strokeRect(cx - pitchW / 2, cy - pitchH / 2, pitchW, pitchH);

    // Creases
    const creaseW = pitchW * 1.8;
    ctx.strokeStyle = colors.crease;
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(cx - creaseW / 2, cy + pitchH / 2 - 5); ctx.lineTo(cx + creaseW / 2, cy + pitchH / 2 - 5); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx - creaseW / 2, cy - pitchH / 2 + 5); ctx.lineTo(cx + creaseW / 2, cy - pitchH / 2 + 5); ctx.stroke();

    // Zone labels (Tactical HUD)
    ctx.font = '8px Orbitron, monospace';
    ctx.fillStyle = colors.text;
    ctx.textAlign = 'center';
    ctx.fillText('SEC-A [LONG ON]', cx + 25, cy - radius + 20);
    ctx.fillText('SEC-B [LONG OFF]', cx - 25, cy - radius + 20);
    ctx.fillText('SEC-C [FINE LEG]', cx + radius * 0.6, cy + radius - 15);
    ctx.fillText('SEC-D [THIRD MAN]', cx - radius * 0.6, cy + radius - 15);

    // Dynamic Radar Sweep
    if (this.animFrame) {
      this.radarAngle += 0.04;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(this.radarAngle);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, radius, 0, 0.2);
      ctx.lineTo(0, 0);
      ctx.fillStyle = 'rgba(56, 189, 248, 0.15)';
      ctx.fill();
      ctx.restore();
    }

    // Draw field positions
    this.drawPositions(colors);
  }

  drawPositions(colors) {
    const { ctx, cx, cy, radius } = this;
    this.pulsePhase += 0.08;

    this.fieldPositions.forEach((pos, i) => {
      const px = cx - (pos.x_coord / 12) * radius; 
      const py = cy - (pos.z_coord / 12) * radius;

      const pulse = Math.sin(this.pulsePhase + i * 0.5) * 0.4 + 0.6;

      // Outer Danger Ring for specific intents
      if (pos.intent && pos.intent.toLowerCase().includes('boundary')) {
        ctx.beginPath();
        ctx.arc(px, py, 20 + (Math.sin(this.pulsePhase)*5), 0, Math.PI * 2);
        ctx.strokeStyle = colors.danger;
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // Neon Glow
      const glow = ctx.createRadialGradient(px, py, 0, px, py, 16);
      glow.addColorStop(0, colors.dotGlow);
      glow.addColorStop(1, 'transparent');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(px, py, 16, 0, Math.PI * 2);
      ctx.fill();

      // Core Dot
      ctx.beginPath();
      ctx.arc(px, py, 4, 0, Math.PI * 2);
      ctx.fillStyle = colors.dot;
      ctx.fill();
      ctx.strokeStyle = colors.dotBorder;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Cyber Label
      ctx.font = '9px JetBrains Mono';
      ctx.fillStyle = colors.textHigh;
      ctx.textAlign = 'center';
      
      // Box behind text
      const txtW = ctx.measureText(pos.position_name).width;
      ctx.fillStyle = 'rgba(3, 7, 18, 0.7)';
      ctx.fillRect(px - txtW/2 - 2, py - 18, txtW + 4, 10);
      
      ctx.fillStyle = colors.textHigh;
      ctx.fillText(pos.position_name, px, py - 10);
      
      // Intent HUD line
      if (pos.intent) {
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.3)';
        ctx.beginPath();
        ctx.moveTo(px, py - 18);
        ctx.lineTo(px + 10, py - 25);
        ctx.lineTo(px + 40, py - 25);
        ctx.stroke();
        ctx.font = '7px sans-serif';
        ctx.fillStyle = colors.text;
        ctx.textAlign = 'left';
        ctx.fillText(pos.intent.substring(0,10), px + 12, py - 27);
      }
    });
  }

  setPositions(positions) {
    this.fieldPositions = positions || [];
    this.draw();
    this.startAnimation();
  }

  startAnimation() {
    if (this.animFrame) cancelAnimationFrame(this.animFrame);
    const animate = () => {
      this.draw();
      this.animFrame = requestAnimationFrame(animate);
    };
    animate();
    // Stop after 15 seconds to save battery
    setTimeout(() => {
      if (this.animFrame) cancelAnimationFrame(this.animFrame);
      this.draw(); // Final static draw
    }, 15000);
  }

  drawIdle() {
    this.fieldPositions = [];
    this.draw();
  }
}
