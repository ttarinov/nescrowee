"use client";

import { useEffect, useState, useRef, useId } from "react";

type CursorState = "default" | "pointer" | "dragging" | "help";

const hexToRgba = (hex: string, alpha: number): string => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const purpleHex = "#a855f7";
const purpleDarkHex = "#6d28d9";
const purpleRgb = "168, 85, 247";

export function ArrowCursor() {
  const gradientId = useId().replace(/:/g, "");
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [smoothPosition, setSmoothPosition] = useState({ x: 0, y: 0 });
  const [cursorState, setCursorState] = useState<CursorState>("default");
  const [customColor, setCustomColor] = useState<string | null>(null);
  const [pulsePhase, setPulsePhase] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const animationRef = useRef<number | undefined>(undefined);
  const rafId = useRef<number | null>(null);
  const positionRef = useRef({ x: 0, y: 0 });
  const cursorStateRef = useRef<CursorState>("default");

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
        const updatePosition = (e: MouseEvent) => {
          setPosition({ x: e.clientX, y: e.clientY });
          setSmoothPosition({ x: e.clientX, y: e.clientY });
          document.removeEventListener("mousemove", updatePosition);
        };
        document.addEventListener("mousemove", updatePosition, { once: true });
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  useEffect(() => {
    const checkTouchDevice = () => {
      const hasTouchScreen = window.matchMedia("(pointer: coarse)").matches;
      const hasHover = window.matchMedia("(hover: hover)").matches;
      setIsTouchDevice(hasTouchScreen && !hasHover);
    };
    checkTouchDevice();
    const mq = window.matchMedia("(pointer: coarse)");
    mq.addEventListener("change", checkTouchDevice);
    return () => mq.removeEventListener("change", checkTouchDevice);
  }, []);

  useEffect(() => {
    positionRef.current = position;
  }, [position]);

  useEffect(() => {
    cursorStateRef.current = cursorState;
  }, [cursorState]);

  useEffect(() => {
    const animate = () => {
      setSmoothPosition((prev) => {
        const pos = positionRef.current;
        if (cursorStateRef.current === "dragging") return pos;
        return {
          x: pos.x,
          y: pos.y,
        };
      });
      animationRef.current = requestAnimationFrame(animate);
    };
    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, []);

  useEffect(() => {
    if (cursorState === "dragging") {
      const pulseInterval = setInterval(() => {
        setPulsePhase((prev) => (prev + 0.1) % (Math.PI * 2));
      }, 16);
      return () => clearInterval(pulseInterval);
    }
  }, [cursorState]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (rafId.current) cancelAnimationFrame(rafId.current);
      rafId.current = requestAnimationFrame(() => {
        setPosition({ x: e.clientX, y: e.clientY });
        const el = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement | null;
        if (!el) return;
        const helpEl = el.closest("[data-cursor-help]") as HTMLElement | null;
        const colorEl = el.closest("[data-cursor-color]") as HTMLElement | null;
        if (helpEl) {
          setCursorState((prev) => (prev === "dragging" ? "dragging" : "help"));
          setCustomColor(null);
          return;
        }
        if (colorEl) {
          const c = colorEl.getAttribute("data-cursor-color");
          setCustomColor(c);
        } else {
          setCustomColor(null);
        }
      });
    };

    const handleMouseDown = () => setCursorState("dragging");
    const handleMouseUp = () => {
      setCursorState((prev) => (prev === "dragging" ? "default" : prev));
    };

    const isInteractive = (el: HTMLElement) =>
      el.closest("a") ||
      el.matches("a, button, [role='button'], input, textarea, select, [data-hover]");

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest("[data-cursor-help]")) {
        setCursorState((prev) => (prev === "dragging" ? "dragging" : "help"));
        return;
      }
      if (isInteractive(target)) {
        setCursorState((prev) => (prev === "dragging" ? "dragging" : "pointer"));
      }
    };

    const handleMouseOut = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const related = e.relatedTarget as HTMLElement | null;
      if (target.closest("[data-cursor-help]") && !related?.closest("[data-cursor-help]")) {
        setCursorState((prev) => (prev === "dragging" ? "dragging" : "default"));
        return;
      }
      if (isInteractive(target) && (!related || !isInteractive(related))) {
        setCursorState((prev) => (prev === "dragging" ? "dragging" : "default"));
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("mouseover", handleMouseOver);
    document.addEventListener("mouseout", handleMouseOut);

    return () => {
      if (rafId.current) cancelAnimationFrame(rafId.current);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("mouseover", handleMouseOver);
      document.removeEventListener("mouseout", handleMouseOut);
    };
  }, []);

  const getCursorStyles = () => {
    const fillColor = customColor || purpleHex;
    const baseFill = fillColor;
    const baseStroke = customColor ? hexToRgba(customColor, 0.3) : `rgba(${purpleRgb}, 0.3)`;
    const baseGlow = customColor ? hexToRgba(customColor, 0.4) : `rgba(${purpleRgb}, 0.4)`;

    if (cursorState === "help") {
      const pulse = 1 + Math.sin(pulsePhase) * 0.05;
      return {
        rotation: 0,
        scale: 1.1 * pulse,
        fill: baseFill,
        stroke: customColor ? hexToRgba(customColor, 0.5) : `rgba(${purpleRgb}, 0.5)`,
        glow: `drop-shadow(0 0 ${8 * pulse}px ${customColor ? hexToRgba(customColor, 0.6) : `rgba(${purpleRgb}, 0.6)`})`,
        ringScale: 1.2,
        ringOpacity: 0.35,
      };
    }

    switch (cursorState) {
      case "pointer": {
        const pointerPulse = 1 + Math.sin(pulsePhase) * 0.05;
        return {
          rotation: -15,
          scale: 1.15 * pointerPulse,
          fill: baseFill,
          stroke: customColor ? hexToRgba(customColor, 0.5) : `rgba(${purpleRgb}, 0.5)`,
          glow: `drop-shadow(0 0 ${12 * pointerPulse}px ${customColor ? hexToRgba(customColor, 0.7) : `rgba(${purpleRgb}, 0.7)`})`,
          ringScale: 1.3 + Math.sin(pulsePhase) * 0.1,
          ringOpacity: 0.4 + Math.sin(pulsePhase) * 0.2,
        };
      }
      case "dragging": {
        const dragPulse = 0.85 + Math.sin(pulsePhase * 2) * 0.08;
        const dragGlow = 4 + Math.sin(pulsePhase * 2) * 2;
        return {
          rotation: 0,
          scale: dragPulse,
          fill: customColor ? hexToRgba(customColor, 0.8) : `rgba(${purpleRgb}, 0.8)`,
          stroke: customColor ? hexToRgba(customColor, 0.3) : `rgba(${purpleRgb}, 0.3)`,
          glow: `drop-shadow(0 0 ${dragGlow}px ${customColor ? hexToRgba(customColor, 0.5) : `rgba(${purpleRgb}, 0.5)`})`,
          ringScale: 0.8 + Math.sin(pulsePhase * 2) * 0.15,
          ringOpacity: 0.3 + Math.sin(pulsePhase * 2) * 0.2,
        };
      }
      default:
        return {
          rotation: 0,
          scale: 1,
          fill: baseFill,
          stroke: baseStroke,
          glow: `drop-shadow(0 0 4px ${baseGlow})`,
          ringScale: 1,
          ringOpacity: 0,
        };
    }
  };

  const styles = getCursorStyles();
  const pulseIntensity = cursorState === "dragging" ? Math.sin(pulsePhase * 2) * 0.3 + 0.7 : 1;

  if (isTouchDevice) return null;

  return (
    <>
      <svg
        className="pointer-events-none fixed z-[2147483647]"
        style={{
          left: smoothPosition.x,
          top: smoothPosition.y,
          width: 28,
          height: 28,
          transform: `translate(-50%, -50%) rotate(${styles.rotation}deg) scale(${styles.scale})`,
          filter: styles.glow,
          transition: cursorState === "default" || cursorState === "help" ? "transform 0.15s ease-out, filter 0.15s ease-out" : "none",
          opacity: isVisible ? 1 : 0,
        }}
        viewBox="0 0 24 24"
        fill="none"
      >
        <defs>
          <linearGradient
            id={gradientId}
            gradientUnits="userSpaceOnUse"
            x1="2"
            y1="2"
            x2="22"
            y2="22"
          >
            <stop offset="0%" stopColor={purpleHex} />
            <stop offset="100%" stopColor={purpleDarkHex} />
          </linearGradient>
        </defs>
        {cursorState === "default" && (
          <path
            d="M5 3L19 12L12 13L9 20L5 3Z"
            fill={customColor ? styles.fill : `url(#${gradientId})`}
            stroke={styles.stroke}
            strokeWidth="1"
            style={{ transition: "fill 300ms ease-out, stroke 300ms ease-out" }}
          />
        )}

        {cursorState === "help" && (
          <g style={{ transform: `scale(${pulseIntensity})`, transformOrigin: "center" }}>
            <circle cx="12" cy="12" r="10" fill={styles.fill} stroke={styles.stroke} strokeWidth="1" />
            <path d="M12 11v4" stroke="rgba(255,255,255,0.95)" strokeWidth="1.2" strokeLinecap="round" />
            <circle cx="12" cy="8" r="1.5" fill="rgba(255,255,255,0.95)" />
          </g>
        )}

        {cursorState === "pointer" && (
          <g style={{ transform: `scale(${pulseIntensity})`, transformOrigin: "center" }}>
            <path d="M10 2C10 1.45 10.45 1 11 1C11.55 1 12 1.45 12 2V10H10V2Z" fill={styles.fill} stroke={styles.stroke} strokeWidth="0.5" />
            <path d="M12 6C12 5.45 12.45 5 13 5C13.55 5 14 5.45 14 6V11H12V6Z" fill={styles.fill} stroke={styles.stroke} strokeWidth="0.5" />
            <path d="M14 7C14 6.45 14.45 6 15 6C15.55 6 16 6.45 16 7V11H14V7Z" fill={styles.fill} stroke={styles.stroke} strokeWidth="0.5" />
            <path d="M16 8C16 7.45 16.45 7 17 7C17.55 7 18 7.45 18 8V14C18 17 16 20 13 20H11C8 20 6 17 6 14V12C6 11.45 6.45 11 7 11C7.55 11 8 11.45 8 12V14" fill={styles.fill} stroke={styles.stroke} strokeWidth="0.5" />
            <rect x="8" y="10" width="10" height="6" rx="1" fill={styles.fill} stroke={styles.stroke} strokeWidth="0.5" />
          </g>
        )}

        {cursorState === "dragging" && (
          <g style={{ transform: `scale(${pulseIntensity})`, transformOrigin: "center" }}>
            <rect x="6" y="8" width="12" height="10" rx="3" fill={styles.fill} stroke={styles.stroke} strokeWidth="0.5" />
            <path d="M8 8V6C8 5.45 8.45 5 9 5C9.55 5 10 5.45 10 6V8" fill={styles.fill} stroke={styles.stroke} strokeWidth="0.5" />
            <path d="M10 8V5C10 4.45 10.45 4 11 4C11.55 4 12 4.45 12 5V8" fill={styles.fill} stroke={styles.stroke} strokeWidth="0.5" />
            <path d="M12 8V5C12 4.45 12.45 4 13 4C13.55 4 14 4.45 14 5V8" fill={styles.fill} stroke={styles.stroke} strokeWidth="0.5" />
            <path d="M14 8V6C14 5.45 14.45 5 15 5C15.55 5 16 5.45 16 6V8" fill={styles.fill} stroke={styles.stroke} strokeWidth="0.5" />
            <ellipse cx="7" cy="12" rx="2" ry="3" fill={styles.fill} stroke={styles.stroke} strokeWidth="0.5" />
          </g>
        )}
      </svg>

      <div
        className="pointer-events-none fixed z-[2147483646] rounded-full border transition-all duration-200"
        style={{
          left: smoothPosition.x - 16,
          top: smoothPosition.y - 16,
          width: 32,
          height: 32,
          borderColor:
            cursorState === "pointer" || cursorState === "help"
              ? customColor ? hexToRgba(customColor, 0.4) : `rgba(${purpleRgb}, 0.4)`
              : cursorState === "dragging"
                ? customColor ? hexToRgba(customColor, 0.25) : `rgba(${purpleRgb}, 0.25)`
                : "transparent",
          transform: `translate(-50%, -50%) scale(${styles.ringScale})`,
          opacity: isVisible && cursorState !== "default" ? styles.ringOpacity : 0,
          transition: cursorState === "default" ? "opacity 0.2s ease-out, transform 0.2s ease-out" : "none",
        }}
      />
    </>
  );
}
