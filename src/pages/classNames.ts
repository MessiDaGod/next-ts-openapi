function cn(...classes: (string)[]): string {
  return classes.filter((cls) => cls && cls.trim().length > 0).join(" ");
}

export { cn }
