export function getBackgroundColor(color: string): string | null {
  switch (color) {
    case "white":
      return "bg-slate-50";
    case "black":
      return "bg-neutral-900";
    case "green":
      return "bg-lime-400";
    case "red":
      return "bg-red-500";
    default:
      return "bg-slate-50";
  }
}
