import type { ReactNode } from "react";

type Props = {
  label: string;
  children: ReactNode;
  tall?: boolean;
};

export function PhoneMockup({ label, children, tall }: Props) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className={`phone-frame ${tall ? "phone-tall" : ""}`}>
        <div className="phone-notch" />
        <div className="phone-screen">{children}</div>
      </div>
      <p className="phone-label">{label}</p>
    </div>
  );
}

export function PhoneHeader({
  left,
  title,
  right,
}: {
  left?: string;
  title: string;
  right?: string;
}) {
  return (
    <div className="phone-hdr">
      <span>{left ?? ""}</span>
      <span className="phone-hdr-title">{title}</span>
      <span className="phone-hdr-action">{right ?? ""}</span>
    </div>
  );
}
