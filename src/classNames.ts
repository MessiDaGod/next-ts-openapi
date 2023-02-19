function cn(...classes: (string | undefined)[]): string {
  return classes.filter((cls) => cls && cls.trim().length > 0).join(" ");
}

export { cn };
