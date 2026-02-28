export function redirectSystemPath({
  path,
  initial,
}: {
  path: string;
  initial: boolean;
}): string {
  try {
    // Only handle initial cold start (app was closed)
    if (!initial) {
      return path;
    }

    // Try to parse as a URL with our scheme as base
    const url = new URL(path, "broodeed://app");

    console.log(
      `[Native Intent] Parsed URL: ${url.pathname} (Initial: ${initial})`,
    );

    // Handle payment success deep links
    if (url.pathname === "/payment/success") {
      // Convert to our app's route structure
      return path.replace("/payment/success", "/more/premium/success");
    }

    return path;
  } catch {
    console.log("[Native Intent] Failed to parse URL, using original path");
    return path;
  }
}
