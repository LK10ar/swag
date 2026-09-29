import { useEffect, useRef } from 'react';

type Props = {
  baseImage: string;
  revealImage: string;
  radius?: number;
  className?: string;
};

export default function SpotlightReveal({
  baseImage,
  revealImage,
  radius = 260,
  className = '',
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const revealRef = useRef<HTMLDivElement>(null);
  const mouse = useRef({ x: -999, y: -999 });
  const smooth = useRef({ x: -999, y: -999 });
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    const revealLayer = revealRef.current;
    if (!canvas || !revealLayer) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    function resize() {
      if (!canvas) return;
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    function onMouseMove(e: MouseEvent) {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      mouse.current.x = e.clientX - rect.left;
      mouse.current.y = e.clientY - rect.top;
    }
    window.addEventListener('mousemove', onMouseMove);

    function loop() {
      if (!ctx || !canvas || !revealLayer) return;

      smooth.current.x += (mouse.current.x - smooth.current.x) * 0.1;
      smooth.current.y += (mouse.current.y - smooth.current.y) * 0.1;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const grad = ctx.createRadialGradient(
        smooth.current.x,
        smooth.current.y,
        0,
        smooth.current.x,
        smooth.current.y,
        radius,
      );
      grad.addColorStop(0, 'rgba(255,255,255,1)');
      grad.addColorStop(0.4, 'rgba(255,255,255,1)');
      grad.addColorStop(0.6, 'rgba(255,255,255,0.75)');
      grad.addColorStop(0.75, 'rgba(255,255,255,0.4)');
      grad.addColorStop(0.88, 'rgba(255,255,255,0.12)');
      grad.addColorStop(1, 'rgba(255,255,255,0)');

      ctx.beginPath();
      ctx.arc(smooth.current.x, smooth.current.y, radius, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();

      const dataUrl = canvas.toDataURL();
      revealLayer.style.webkitMaskImage = `url(${dataUrl})`;
      revealLayer.style.maskImage = `url(${dataUrl})`;
      revealLayer.style.webkitMaskSize = '100% 100%';
      revealLayer.style.maskSize = '100% 100%';

      rafRef.current = requestAnimationFrame(loop);
    }
    loop();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMouseMove);
      cancelAnimationFrame(rafRef.current);
    };
  }, [radius]);

  return (
    <div className={`overflow-hidden ${className || 'relative'}`}>
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${baseImage})` }}
      />
      <div
        ref={revealRef}
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${revealImage})` }}
      />
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" style={{ display: 'block' }} />
    </div>
  );
}
