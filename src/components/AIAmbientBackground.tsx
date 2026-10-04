"use client";

import { useEffect, useRef, useState } from "react";

interface AIAmbientBackgroundProps {
  intensity?: "full" | "subtle" | "minimal";
  activeState?: boolean;
}

export default function AIAmbientBackground({ intensity = "full", activeState = false }: AIAmbientBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = window.innerWidth;
    let height = window.innerHeight;

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };
    window.addEventListener("resize", resize);
    resize();

    // Configuration based on intensity
    const particleCount = intensity === "full" ? (width < 768 ? 100 : 250) : intensity === "subtle" ? 100 : 50;
    const maxDistance = 150;
    
    class Particle {
      x: number;
      y: number;
      baseX: number;
      baseY: number;
      vx: number;
      vy: number;
      size: number;
      phase: number;
      speed: number;

      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.baseX = this.x;
        this.baseY = this.y;
        this.vx = (Math.random() - 0.5) * 0.2;
        this.vy = (Math.random() - 0.5) * 0.2;
        this.size = Math.random() * 1.5 + 0.5;
        this.phase = Math.random() * Math.PI * 2;
        this.speed = Math.random() * 0.01 + 0.005;
      }

      update(time: number, isInvestigating: boolean) {
        if (prefersReducedMotion) return;

        // Flowing wave deformation
        const waveX = Math.sin(time * this.speed + this.phase) * 30;
        const waveY = Math.cos(time * this.speed * 0.8 + this.phase) * 30;

        if (isInvestigating) {
          // Converge towards center slightly
          const centerX = width / 2;
          const centerY = height / 2;
          const dx = centerX - this.x;
          const dy = centerY - this.y;
          this.x += dx * 0.01 + this.vx;
          this.y += dy * 0.01 + this.vy;
        } else {
          // Normal flowing state
          this.x = this.baseX + waveX;
          this.y = this.baseY + waveY;
          
          this.baseX += this.vx;
          this.baseY += this.vy;

          if (this.baseX < 0 || this.baseX > width) this.vx *= -1;
          if (this.baseY < 0 || this.baseY > height) this.vy *= -1;
        }
      }

      draw(ctx: CanvasRenderingContext2D, time: number) {
        // Brightness variation
        const brightness = Math.sin(time * this.speed * 2 + this.phase) * 0.5 + 0.5;
        ctx.fillStyle = `rgba(0, 191, 166, ${brightness * 0.5 + 0.1})`;
        if (activeState && brightness > 0.9) {
          ctx.fillStyle = `rgba(57, 255, 136, 0.8)`; // Signal pulse
        }
        
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const particles: Particle[] = Array.from({ length: particleCount }, () => new Particle());

    const render = (time: number) => {
      ctx.clearRect(0, 0, width, height);

      // Draw connections
      ctx.lineWidth = 0.5;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < maxDistance) {
            const opacity = (1 - distance / maxDistance) * (intensity === "full" ? 0.15 : 0.05);
            ctx.strokeStyle = `rgba(0, 191, 166, ${opacity})`;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      // Draw particles
      particles.forEach(p => {
        p.update(time, activeState);
        p.draw(ctx, time);
      });

      if (!prefersReducedMotion) {
        animationFrameId = requestAnimationFrame(render);
      }
    };

    render(0);

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [intensity, activeState, prefersReducedMotion]);

  const baseOpacity = intensity === "full" ? "opacity-100" : intensity === "subtle" ? "opacity-60" : "opacity-30";
  const glowOpacity = activeState ? "opacity-60" : intensity === "full" ? "opacity-30" : "opacity-10";

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none z-0 transition-opacity duration-1000 ${baseOpacity} bg-[#020303]`}>
      
      {/* Deep Black Base is handled by bg-[#020303] above */}
      
      {/* Atmospheric Glows */}
      <div 
        className={`absolute top-[10%] left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[#00BFA6] blur-[150px] rounded-full transition-all duration-[3000ms] ${glowOpacity} ${activeState ? 'scale-110' : 'scale-100'}`} 
        style={{ mixBlendMode: 'screen' }}
      />

      {/* Canvas Particle Field */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
    </div>
  );
}
