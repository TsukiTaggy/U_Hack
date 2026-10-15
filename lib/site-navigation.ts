export const primaryNavigation = [
  { label: "Home", href: "/" },
  { label: "Learn", href: "/learn" },
  { label: "Missions", href: "/play" },
] as const;

export const homeActions = {
  learn: { label: "Start practising", href: "/learn" },
  missions: { label: "View missions", href: "/play" },
  launch: { label: "Launch SafeStart", href: "/play" },
} as const;
