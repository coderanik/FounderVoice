import { ReactNode } from "react";

export function ScreenWrap({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="fv-screen-wrap">
      {children}
      <div className="fv-screen-label">{label}</div>
    </div>
  );
}

export function Phone({
  children,
  tall,
  wide,
}: {
  children: ReactNode;
  tall?: boolean;
  wide?: boolean;
}) {
  return (
    <div className={`fv-phone${tall ? " tall" : ""}${wide ? " wide" : ""}`}>
      <div className="fv-phone-screen">{children}</div>
    </div>
  );
}

export function Hdr({
  left,
  title,
  right,
  center,
}: {
  left?: ReactNode;
  title: string;
  right?: ReactNode;
  center?: boolean;
}) {
  return (
    <div className="fv-hdr">
      <span className="back">{left ?? ""}</span>
      <span className={`title${center ? "" : ""}`} style={center ? { margin: "0 auto" } : undefined}>
        {title}
      </span>
      <span className="action">{right ?? ""}</span>
    </div>
  );
}

export function OverlayCard({
  title,
  body,
  cancel,
  confirm,
}: {
  title: string;
  body: string;
  cancel: string;
  confirm: string;
}) {
  return (
    <div className="fv-overlay">
      <div className="fv-overlay-card">
        <div style={{ fontWeight: "bold", marginBottom: 6 }}>{title}</div>
        <div>{body}</div>
        <div className="fv-btns">
          <div className="fv-btn fv-btn-outline">{cancel}</div>
          <div className="fv-btn fv-btn-fill">{confirm}</div>
        </div>
      </div>
    </div>
  );
}
