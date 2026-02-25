/**
 * Broodeed Design System - Color Tokens
 */

// DARK THEME (Primary - outdoor visibility)
export const dark = {
  // Backgrounds
  bg_deep: "#0D1B12", // Root background — darkest
  bg_surface: "#162518", // Cards, bottom sheets
  bg_elevated: "#1E3320", // Modals, popovers, input backgrounds
  bg_overlay: "rgba(13, 27, 18, 0.85)",

  // Brand
  brand_primary: "#4CAF72", // Green — life, growth
  brand_amber: "#F5A623", // Amber — harvest, CTAs, money
  brand_amber_dim: "#C47E0F", // Amber pressed state

  // Semantic
  danger: "#E05C5C", // Mortality, errors, destructive actions
  danger_dim: "#5C1F1F", // Danger background tint
  warning: "#F5C542", // Warnings
  success: "#4CAF72", // Success (same as brand_primary)

  // Text
  text_primary: "#F0F5F1", // Main text — warm near-white
  text_secondary: "#8BA690", // Labels, descriptions
  text_disabled: "#4A5E4D", // Inactive states
  text_inverse: "#0D1B12", // Text on amber buttons

  // Borders & Dividers
  border: "#253C29",
  border_focus: "#4CAF72",
  divider: "#1E3320",

  // Chart colours
  chart_1: "#4CAF72", // Primary (green)
  chart_2: "#F5A623", // Secondary (amber)
  chart_3: "#5B8FF9", // Tertiary (blue)
  chart_4: "#E05C5C", // Danger (red)
  chart_fill: "rgba(76, 175, 114, 0.12)",
};

// LIGHT THEME (Not used - dark only for outdoor)
export const light = {
  bg_deep: "#F5F5F5",
  bg_surface: "#FFFFFF",
  bg_elevated: "#FFFFFF",
  bg_overlay: "rgba(255, 255, 255, 0.85)",

  brand_primary: "#4CAF72",
  brand_amber: "#F5A623",
  brand_amber_dim: "#C47E0F",

  danger: "#E05C5C",
  danger_dim: "#FFEBEE",
  warning: "#F5C542",
  success: "#4CAF72",

  text_primary: "#1A1A1A",
  text_secondary: "#666666",
  text_disabled: "#BDBDBD",
  text_inverse: "#FFFFFF",

  border: "#E0E0E0",
  border_focus: "#4CAF72",
  divider: "#EEEEEE",

  chart_1: "#4CAF72",
  chart_2: "#F5A623",
  chart_3: "#5B8FF9",
  chart_4: "#E05C5C",
  chart_fill: "rgba(76, 175, 114, 0.12)",
};

// Default export for backwards compatibility
const tintColorLight = "#4CAF72";
const tintColorDark = "#4CAF72";

export default {
  light: {
    background: light.bg_surface,
    surface: light.bg_surface,
    surfaceElevated: light.bg_elevated,
    primary: light.brand_primary,
    accent: light.brand_amber,
    danger: light.danger,
    text: light.text_primary,
    textSecondary: light.text_secondary,
    tint: tintColorLight,
    tabIconDefault: light.text_secondary,
    tabIconSelected: light.brand_primary,
    divider: light.divider,
  },
  dark: {
    background: dark.bg_deep,
    surface: dark.bg_surface,
    surfaceElevated: dark.bg_elevated,
    primary: dark.brand_primary,
    accent: dark.brand_amber,
    danger: dark.danger,
    text: dark.text_primary,
    textSecondary: dark.text_secondary,
    tint: tintColorDark,
    tabIconDefault: dark.text_secondary,
    tabIconSelected: dark.brand_primary,
    divider: dark.divider,
  },
};
