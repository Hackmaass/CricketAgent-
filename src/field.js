// ═══════════════════════════════════════════
// TACTICAL FIELD RENDERER — Canvas-based cricket field
// ═══════════════════════════════════════════

export class TacticalField {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
    this.fieldPositions = [];
    this.animFrame = null;
    this.pulsePhase = 0;
    
    // Store bound resize listener for safe memory de-allocation
    this.resizeBound = this.resize.bind(this);
    window.addEventListener('resize', this.resizeBound);
    this.resize();
  }

  // Pure memory de-allocation to avoid resize listeners leaks
  destroy() {
    if (this.animFrame) cancelAnimationFrame(this.animFrame);
    window.removeEventListener('resize', this.resizeBound);
  }

  resize() {
    const container = this.canvas.parentElement;
    if (!container) return;
    const size = Math.max(100, Math.min(container.clientWidth - 20, container.clientHeight - 20, 400));
    this.canvas.width = size;
    this.canvas.height = size;
    this.cx = size / 2;
    this.cy = size / 2;
    this.radius = size * 0.44;
    this.draw();
  }

  draw() {
    const { ctx, cx, cy, radius } = this;
    if (radius < 10) return; // guard against zero-size container
    const w = this.canvas.width;
    const h = this.canvas.height;
    ctx.clearRect(0, 0, w, h);

    // Theme detection
    const isBW = document.body.classList.contains('bw-theme');
    
    // Color Palette
    const colors = isBW ? {
      outfield: '#050505',
      boundary: '#ffffff',
      grid: '#1a1a1a',
      inner: '#222222',
      pitch: '#0d0d0d',
      pitchBorder: '#333333',
      text: '#888888',
      textHigh: '#ffffff',
      crease: '#333333',
      dotGlow: 'rgba(255, 255, 255, 0.3)',
      dot: '#ffffff',
      dotBorder: '#ffffff'
    } : {
      outfield: 'rgba(0, 40, 20, 0.4)',
      boundary: 'rgba(0,200,255,0.25)',
      grid: 'rgba(0,200,255,0.03)',
      inner: 'rgba(0,200,255,0.15)',
      pitch: 'rgba(180, 150, 100, 0.35)',
      pitchBorder: 'rgba(180, 150, 100, 0.5)',
      text: 'rgba(0,200,255,0.2)',
      textHigh: 'rgba(0,200,255,0.8)',
      crease: 'rgba(255,255,255,0.3)',
      dotGlow: 'rgba(0,200,255,0.4)',
      dot: 'rgba(0,200,255,0.9)',
      dotBorder: 'rgba(0,200,255,0.5)'
    };

    // Field boundary glow
    if (!isBW) {
      const boundaryGrad = ctx.createRadialGradient(cx, cy, radius * 0.8, cx, cy, radius * 1.1);
      boundaryGrad.addColorStop(0, 'transparent');
      boundaryGrad.addColorStop(0.8, colors.grid);
      boundaryGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = boundaryGrad;
      ctx.fillRect(0, 0, w, h);
    } else {
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, w, h);
    }

    // Outfield
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fillStyle = colors.outfield;
    ctx.fill();
    ctx.strokeStyle = colors.boundary;
    ctx.lineWidth = isBW ? 1 : 1.5;
    ctx.stroke();

    // 30-yard circle
    const innerR = radius * 0.55;
    ctx.beginPath();
    ctx.arc(cx, cy, innerR, 0, Math.PI * 2);
    ctx.strokeStyle = colors.inner;
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.stroke();
    ctx.setLineDash([]);

    // Pitch
    const pitchW = radius * 0.06;
    const pitchH = radius * 0.35;
    ctx.fillStyle = colors.pitch;
    ctx.fillRect(cx - pitchW / 2, cy - pitchH / 2, pitchW, pitchH);
    ctx.strokeStyle = colors.pitchBorder;
    ctx.lineWidth = 1;
    ctx.strokeRect(cx - pitchW / 2, cy - pitchH / 2, pitchW, pitchH);

    // Creases
    const creaseW = pitchW * 2;
    ctx.strokeStyle = colors.crease;
    ctx.lineWidth = 1;
    // Batting crease
    ctx.beginPath();
    ctx.moveTo(cx - creaseW / 2, cy + pitchH / 2 - 4);
    ctx.lineTo(cx + creaseW / 2, cy + pitchH / 2 - 4);
    ctx.stroke();
    // Bowling crease
    ctx.beginPath();
    ctx.moveTo(cx - creaseW / 2, cy - pitchH / 2 + 4);
    ctx.lineTo(cx + creaseW / 2, cy - pitchH / 2 + 4);
    ctx.stroke();

    // Zone labels
    ctx.font = '9px Orbitron';
    ctx.fillStyle = colors.text;
    ctx.textAlign = 'center';
    ctx.fillText('LONG ON', cx + 20, cy - radius + 16);
    ctx.fillText('LONG OFF', cx - 20, cy - radius + 16);
    ctx.fillText('FINE LEG', cx + radius * 0.6, cy + radius - 10);
    ctx.fillText('THIRD MAN', cx - radius * 0.6, cy + radius - 10);
    ctx.fillText('MID WICKET', cx + radius * 0.7, cy - 5);
    ctx.fillText('COVER', cx - radius * 0.7, cy - 5);

    // Direction indicators
    ctx.font = '8px JetBrains Mono';
    ctx.fillStyle = colors.text;
    ctx.fillText('LEG ◄', cx + radius - 30, cy + radius + 14);
    ctx.fillText('► OFF', cx - radius + 30, cy + radius + 14);

    // Draw field positions
    this.drawPositions(colors);
  }

  drawPositions(colors) {
    const { ctx, cx, cy, radius } = this;
    this.pulsePhase += 0.05;

    this.fieldPositions.forEach((pos, i) => {
      const px = cx - (pos.x_coord / 12) * radius; // neg-x = leg side = right on screen
      const py = cy - (pos.z_coord / 12) * radius;

      // Pulse glow
      const pulse = Math.sin(this.pulsePhase + i * 0.5) * 0.3 + 0.7;

      // Glow
      const glow = ctx.createRadialGradient(px, py, 0, px, py, 14);
      glow.addColorStop(0, colors.dotGlow);
      glow.addColorStop(1, 'transparent');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(px, py, 14, 0, Math.PI * 2);
      ctx.fill();

      // Dot
      ctx.beginPath();
      ctx.arc(px, py, 4, 0, Math.PI * 2);
      ctx.fillStyle = colors.dot;
      ctx.fill();
      ctx.strokeStyle = colors.dotBorder;
      ctx.lineWidth = 1;
      ctx.stroke();

      // Label
      ctx.font = '8px Rajdhani';
      ctx.fillStyle = colors.textHigh;
      ctx.textAlign = 'center';
      ctx.fillText(pos.position_name, px, py - 10);
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
    // Stop after 8 seconds to save battery and resource consumption (Efficiency)
    setTimeout(() => {
      if (this.animFrame) cancelAnimationFrame(this.animFrame);
      this.draw(); // Final static draw
    }, 8000);
  }

  drawIdle() {
    this.fieldPositions = [];
    this.draw();
  }
}
