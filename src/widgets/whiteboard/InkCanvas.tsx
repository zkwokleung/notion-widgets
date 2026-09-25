import { useEffect, useRef, type PointerEvent } from "react";
import type { Stroke } from "@/api/client";

interface InkCanvasProps {
  strokes: Stroke[];
  onStrokesChange: (strokes: Stroke[]) => void;
  onSizeChange: (size: { width: number; height: number }) => void;
  "aria-label": string;
}

function draw(canvas: HTMLCanvasElement, strokes: Stroke[], current: Stroke | null) {
  const context = canvas.getContext("2d");
  if (!context) return;
  const ratio = window.devicePixelRatio || 1;
  context.setTransform(ratio, 0, 0, ratio, 0, 0);
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.strokeStyle = getComputedStyle(canvas).color;
  context.lineWidth = 4;
  context.lineCap = "round";
  context.lineJoin = "round";
  for (const [xs, ys] of current ? [...strokes, current] : strokes) {
    context.beginPath();
    xs.forEach((x, i) => (i === 0 ? context.moveTo(x, ys[i]) : context.lineTo(x, ys[i])));
    if (xs.length === 1) context.lineTo(xs[0] + 0.1, ys[0]);
    context.stroke();
  }
}

function InkCanvas({ strokes, onStrokesChange, onSizeChange, "aria-label": label }: InkCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const current = useRef<Stroke | null>(null);
  const startedAt = useRef(0);
  const strokesRef = useRef(strokes);

  useEffect(() => {
    strokesRef.current = strokes;
    if (canvasRef.current) draw(canvasRef.current, strokes, current.current);
  }, [strokes]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const resize = () => {
      const ratio = window.devicePixelRatio || 1;
      const { width, height } = canvas.getBoundingClientRect();
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      onSizeChange({ width, height });
      draw(canvas, strokesRef.current, current.current);
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    return () => observer.disconnect();
  }, [onSizeChange]);

  const point = (event: PointerEvent<HTMLCanvasElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    return [
      Math.round(event.clientX - rect.left),
      Math.round(event.clientY - rect.top),
      Math.round(performance.now() - startedAt.current),
    ] as const;
  };

  const handlePointerDown = (event: PointerEvent<HTMLCanvasElement>) => {
    if (event.button !== 0) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    if (strokes.length === 0) startedAt.current = performance.now();
    const [x, y, t] = point(event);
    current.current = [[x], [y], [t]];
    draw(event.currentTarget, strokes, current.current);
  };

  const handlePointerMove = (event: PointerEvent<HTMLCanvasElement>) => {
    const stroke = current.current;
    if (!stroke) return;
    const [x, y, t] = point(event);
    stroke[0].push(x);
    stroke[1].push(y);
    stroke[2].push(t);
    draw(event.currentTarget, strokes, stroke);
  };

  const handlePointerUp = () => {
    const stroke = current.current;
    current.current = null;
    if (stroke) onStrokesChange([...strokes, stroke]);
  };

  return (
    <canvas
      ref={canvasRef}
      role="img"
      aria-label={label}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      className="h-full w-full cursor-crosshair touch-none text-foreground"
    />
  );
}

export default InkCanvas;
