export function redirectSystemPath({
  path,
  initial,
}: {
  path: string;
  initial: boolean;
}): string {
  console.log(
    `[Native Intent] Intercepted path: ${path} (Initial: ${initial})`,
  );

  if (path.startsWith("/payment/success")) {
    return path.replace("/payment/success", "/more/premium/success");
  }

  return path;
}
