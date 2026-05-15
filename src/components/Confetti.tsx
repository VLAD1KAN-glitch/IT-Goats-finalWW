import { useEffect, useRef } from 'react';
import { create } from 'zustand';

interface ConfettiState {
  isActive: boolean;
  fire: () => void;
}

export const useConfettiStore = create<ConfettiState>((set) => ({
  isActive: false,
  fire: () => {
    set({ isActive: true });
    setTimeout(() => set({ isActive: false }), 4000);
  }
}));

const COLORS = ['#0061A4', '#535F70', '#FFB4AB', '#C4EED0', '#D3E3FD'];

class Particle {
  x: number;
  y: number;
  r: number;
  dx: number;
  dy: number;
  color: string;
  tilt: number;
  tiltAngleIncr: number;
  tiltAngle: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
    this.r = Math.random() * 6 + 2;
    this.dx = (Math.random() - 0.5) * 10;
    this.dy = (Math.random() - 1) * 15 - 5;
    this.color = COLORS[Math.floor(Math.random() * COLORS.length)];
    this.tilt = Math.floor(Math.random() * 10) - 10;
    this.tiltAngleIncr = (0.07 * Math.random()) + 0.05;
    this.tiltAngle = 0;
  }

  update() {
    this.tiltAngle += this.tiltAngleIncr;
    this.dy += 0.3; // gravity
    this.x += this.dx;
    this.y += this.dy;
    this.tilt = Math.sin(this.tiltAngle) * 15;
  }

  draw(context: CanvasRenderingContext2D) {
    context.beginPath();
    context.lineWidth = this.r;
    context.strokeStyle = this.color;
    context.moveTo(this.x + this.tilt + this.r, this.y);
    context.lineTo(this.x + this.tilt, this.y + this.tilt + this.r);
    context.stroke();
  }
}

export function Confetti() {
  const isActive = useConfettiStore(state => state.isActive);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const frameRef = useRef<number>(null);

  useEffect(() => {
    if (!isActive || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Initialize particles
    particlesRef.current = Array.from({ length: 150 }).map(() => {
      return new Particle(canvas.width / 2 + (Math.random() - 0.5) * 50, canvas.height / 2);
    });

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      let allDead = true;
      particlesRef.current.forEach(p => {
        p.update();
        p.draw(ctx);
        if (p.y < canvas.height) allDead = false;
      });

      if (!allDead) {
        frameRef.current = requestAnimationFrame(render);
      }
    };

    frameRef.current = requestAnimationFrame(render);

    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [isActive]);

  if (!isActive) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[100]"
    />
  );
}
