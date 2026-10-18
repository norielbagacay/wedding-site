import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

function Icon({ children, ...props }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      {children}
    </svg>
  );
}

export function MusicIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M9 18V5.5l11-2V16" />
      <circle cx="6.5" cy="18" r="2.5" />
      <circle cx="17.5" cy="16" r="2.5" />
    </Icon>
  );
}

export function MusicOffIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M9 18V5.5l11-2V16" />
      <circle cx="6.5" cy="18" r="2.5" />
      <circle cx="17.5" cy="16" r="2.5" />
      <path d="M3 3l18 18" />
    </Icon>
  );
}

export function ChevronDownIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M6 9l6 6 6-6" />
    </Icon>
  );
}

export function ArrowRightIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </Icon>
  );
}

export function RingsIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="9" cy="14" r="5.5" />
      <circle cx="15" cy="14" r="5.5" />
      <path d="M13 5.5l2-2.5 2 2.5-2 2z" />
    </Icon>
  );
}

export function DinnerIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="13" r="5.5" />
      <circle cx="12" cy="13" r="3" />
      <path d="M3 5v4a1.5 1.5 0 0 0 3 0V5M4.5 9v10M20 5c-1.5 1-2 3-2 5h2v9" />
    </Icon>
  );
}

export function PinIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M12 21s-6.5-6.2-6.5-11a6.5 6.5 0 0 1 13 0c0 4.8-6.5 11-6.5 11z" />
      <circle cx="12" cy="10" r="2.3" />
    </Icon>
  );
}
