// Confete leve, sem libs: dispara partículas a partir de um ponto da tela.
const COLORS = ["#f59a2d", "#efc75e", "#e4572e", "#a4c46b", "#8fb6c9"];

export function celebrate(x: number, y: number, count = 18) {
  if (typeof document === "undefined") return;
  if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;

  for (let i = 0; i < count; i++) {
    const p = document.createElement("div");
    const size = 6 + Math.random() * 6;
    p.style.cssText = [
      "position:fixed",
      `left:${x}px`,
      `top:${y}px`,
      `width:${size}px`,
      `height:${size}px`,
      `background:${COLORS[i % COLORS.length]}`,
      "border-radius:2px",
      "pointer-events:none",
      "z-index:9999",
      "will-change:transform,opacity",
    ].join(";");
    document.body.appendChild(p);

    const angle = (Math.PI * 2 * i) / count + Math.random() * 0.6;
    const dist = 60 + Math.random() * 90;
    const dx = Math.cos(angle) * dist;
    const dy = Math.sin(angle) * dist - 40; // leve viés para cima
    const rot = Math.random() * 720 - 360;

    p.animate(
      [
        { transform: "translate(0,0) rotate(0deg)", opacity: 1 },
        {
          transform: `translate(${dx}px, ${dy + 140}px) rotate(${rot}deg)`,
          opacity: 0,
        },
      ],
      { duration: 700 + Math.random() * 450, easing: "cubic-bezier(.2,.7,.3,1)" },
    ).onfinish = () => p.remove();
  }
}

/** Dispara a partir do centro de um elemento (ex.: o botão clicado). */
export function celebrateFrom(el: Element | null, count?: number) {
  if (!el) return;
  const r = el.getBoundingClientRect();
  celebrate(r.left + r.width / 2, r.top + r.height / 2, count);
}
