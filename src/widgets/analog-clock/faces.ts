import type { ClockFace } from "../../../shared/widgetConfigs";
import type { LocalTime } from "../world-clock/zones";

/** All faces are drawn in a 200×200 viewBox centred on (100, 100). */
export const CENTER = 100;
export const RADIUS = 96;

interface Marks {
  /** 1 marks every hour, 3 only the quarters. */
  every: 1 | 3;
  shape: "line" | "dot";
  length: number;
  width: number;
}

interface Hand {
  length: number;
  width: number;
  /** How far the hand extends past the centre, opposite the tip. */
  tail: number;
}

export interface FaceSpec {
  label: string;
  /** Outer ring stroke width; 0 draws no ring. */
  rim: number;
  hourMarks: Marks | null;
  minuteMarks: Pick<Marks, "length" | "width"> | null;
  numerals: "arabic" | "roman" | null;
  numeralRadius: number;
  numeralSize: number;
  /** Numerals fall back to a serif when the widget uses the default font. */
  serifNumerals: boolean;
  linecap: "round" | "butt" | "square";
  hour: Hand;
  minute: Hand;
  /** A lollipop draws a filled circle of this radius at the tip; 0 for a plain hand. */
  second: Hand & { lollipop: number };
  cap: number;
}

export const FACES: Record<ClockFace, FaceSpec> = {
  classic: {
    label: "Classic",
    rim: 3,
    hourMarks: { every: 1, shape: "line", length: 10, width: 2.5 },
    minuteMarks: { length: 5, width: 1 },
    numerals: "arabic",
    numeralRadius: 70,
    numeralSize: 15,
    serifNumerals: false,
    linecap: "round",
    hour: { length: 50, width: 5, tail: 10 },
    minute: { length: 72, width: 3.5, tail: 10 },
    second: { length: 80, width: 1.25, tail: 18, lollipop: 0 },
    cap: 4,
  },
  minimal: {
    label: "Minimal",
    rim: 0,
    hourMarks: { every: 3, shape: "line", length: 8, width: 2 },
    minuteMarks: null,
    numerals: null,
    numeralRadius: 0,
    numeralSize: 0,
    serifNumerals: false,
    linecap: "round",
    hour: { length: 48, width: 4, tail: 0 },
    minute: { length: 72, width: 3, tail: 0 },
    second: { length: 78, width: 1, tail: 0, lollipop: 0 },
    cap: 3,
  },
  modern: {
    label: "Modern",
    rim: 0,
    hourMarks: { every: 1, shape: "dot", length: 3, width: 0 },
    minuteMarks: null,
    numerals: null,
    numeralRadius: 0,
    numeralSize: 0,
    serifNumerals: false,
    linecap: "round",
    hour: { length: 46, width: 8, tail: 12 },
    minute: { length: 68, width: 6, tail: 12 },
    second: { length: 74, width: 2, tail: 16, lollipop: 0 },
    cap: 6,
  },
  roman: {
    label: "Roman",
    rim: 1.25,
    hourMarks: { every: 1, shape: "line", length: 6, width: 1.5 },
    minuteMarks: { length: 3, width: 0.75 },
    numerals: "roman",
    numeralRadius: 74,
    numeralSize: 13,
    serifNumerals: true,
    linecap: "butt",
    hour: { length: 48, width: 3, tail: 12 },
    minute: { length: 70, width: 2, tail: 12 },
    second: { length: 78, width: 1, tail: 16, lollipop: 0 },
    cap: 3,
  },
  station: {
    label: "Station",
    rim: 0,
    hourMarks: { every: 1, shape: "line", length: 22, width: 7 },
    minuteMarks: { length: 9, width: 3 },
    numerals: null,
    numeralRadius: 0,
    numeralSize: 0,
    serifNumerals: false,
    linecap: "butt",
    hour: { length: 56, width: 9, tail: 20 },
    minute: { length: 84, width: 7, tail: 20 },
    second: { length: 66, width: 2.5, tail: 22, lollipop: 6 },
    cap: 0,
  },
};

const ROMAN = ["XII", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI"];

export function numeralAt(index: number, kind: NonNullable<FaceSpec["numerals"]>): string {
  return kind === "roman" ? ROMAN[index] : String(index === 0 ? 12 : index);
}

export interface Point {
  x: number;
  y: number;
}

/** A point at `radius` from the centre, `index` steps of a `total`-step circle clockwise from 12. */
export function pointOnDial(index: number, total: number, radius: number): Point {
  const angle = (index / total) * 2 * Math.PI;
  return { x: CENTER + radius * Math.sin(angle), y: CENTER - radius * Math.cos(angle) };
}

export interface HandAngles {
  hour: number;
  minute: number;
  second: number;
}

/** Degrees clockwise from 12 for each hand. */
export function handAngles({ hours, minutes, seconds }: LocalTime): HandAngles {
  return {
    hour: ((hours % 12) + minutes / 60 + seconds / 3600) * 30,
    minute: (minutes + seconds / 60) * 6,
    second: seconds * 6,
  };
}
