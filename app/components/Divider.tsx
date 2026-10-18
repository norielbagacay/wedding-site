/** The gilt divider from the design, used under the names and section titles. */
export function Divider({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 20" className={className} aria-hidden="true" focusable="false">
      <path d="M2 10h72M126 10h72" stroke="currentColor" strokeWidth="1" opacity="0.7" />
      <path
        d="M100 10c-5-7-14-7-16-1-1 4 4 6 7 3M100 10c5-7 14-7 16-1 1 4-4 6-7 3M84 10c-3 0-6 1-8 0M116 10c3 0 6 1 8 0"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
      <path d="M100 4l3.5 6-3.5 6-3.5-6z" fill="currentColor" />
    </svg>
  );
}
