import { CENTER, numeralAt, pointOnDial, RADIUS, type FaceSpec, type HandAngles } from "./faces";

const ACCENT_STROKE = "stroke-(--accent-light) dark:stroke-(--accent-dark)";
const ACCENT_FILL = "fill-(--accent-light) dark:fill-(--accent-dark)";

interface HandProps {
  angle: number;
  hand: FaceSpec["hour"];
  linecap: FaceSpec["linecap"];
  className: string;
}

function Hand({ angle, hand, linecap, className }: HandProps) {
  return (
    <line
      x1={CENTER}
      y1={CENTER + hand.tail}
      x2={CENTER}
      y2={CENTER - hand.length}
      strokeWidth={hand.width}
      strokeLinecap={linecap}
      transform={`rotate(${angle} ${CENTER} ${CENTER})`}
      className={className}
    />
  );
}

interface DialProps {
  spec: FaceSpec;
  angles: HandAngles;
  showSeconds: boolean;
  numeralFont?: string;
}

function Dial({ spec, angles, showSeconds, numeralFont }: DialProps) {
  const { numerals } = spec;
  const marks = [];
  if (spec.minuteMarks) {
    for (let index = 0; index < 60; index++) {
      if (index % 5 === 0 && spec.hourMarks) continue;
      const outer = pointOnDial(index, 60, RADIUS);
      const inner = pointOnDial(index, 60, RADIUS - spec.minuteMarks.length);
      marks.push(
        <line key={`m${index}`} x1={outer.x} y1={outer.y} x2={inner.x} y2={inner.y} strokeWidth={spec.minuteMarks.width} className="stroke-muted-foreground" />
      );
    }
  }
  if (spec.hourMarks) {
    const { every, shape, length, width } = spec.hourMarks;
    for (let index = 0; index < 12; index += every) {
      if (shape === "dot") {
        const at = pointOnDial(index, 12, RADIUS - length - 4);
        marks.push(<circle key={`h${index}`} cx={at.x} cy={at.y} r={length} className="fill-foreground" />);
      } else {
        const outer = pointOnDial(index, 12, RADIUS);
        const inner = pointOnDial(index, 12, RADIUS - length);
        marks.push(
          <line key={`h${index}`} x1={outer.x} y1={outer.y} x2={inner.x} y2={inner.y} strokeWidth={width} strokeLinecap={spec.linecap} className="stroke-foreground" />
        );
      }
    }
  }

  return (
    <svg viewBox="0 0 200 200" className="h-auto w-full" aria-hidden>
      {spec.rim > 0 && (
        <circle cx={CENTER} cy={CENTER} r={RADIUS - spec.rim / 2} fill="none" strokeWidth={spec.rim} className="stroke-foreground" />
      )}
      {marks}
      {numerals &&
        Array.from({ length: 12 }, (_, index) => {
          const at = pointOnDial(index, 12, spec.numeralRadius);
          return (
            <text
              key={index}
              x={at.x}
              y={at.y}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={spec.numeralSize}
              fontWeight={500}
              style={{ fontFamily: numeralFont }}
              className="fill-foreground"
            >
              {numeralAt(index, numerals)}
            </text>
          );
        })}
      <Hand angle={angles.hour} hand={spec.hour} linecap={spec.linecap} className="stroke-foreground" />
      <Hand angle={angles.minute} hand={spec.minute} linecap={spec.linecap} className="stroke-foreground" />
      {showSeconds && (
        <g transform={`rotate(${angles.second} ${CENTER} ${CENTER})`} className={ACCENT_STROKE}>
          <line x1={CENTER} y1={CENTER + spec.second.tail} x2={CENTER} y2={CENTER - spec.second.length} strokeWidth={spec.second.width} strokeLinecap={spec.linecap} />
          {spec.second.lollipop > 0 && (
            <circle cx={CENTER} cy={CENTER - spec.second.length} r={spec.second.lollipop} className={ACCENT_FILL} />
          )}
          {spec.cap === 0 && <circle cx={CENTER} cy={CENTER} r={spec.second.width * 1.5} className={ACCENT_FILL} />}
        </g>
      )}
      {spec.cap > 0 && <circle cx={CENTER} cy={CENTER} r={spec.cap} className={ACCENT_FILL} />}
    </svg>
  );
}

export default Dial;
