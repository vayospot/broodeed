const tintColorLight = "#4CAF72";
const tintColorDark = "#4CAF72";

// Dark theme optimized for outdoor visibility
export default {
  light: {
    // Primary backgrounds
    background: "#f5f5f5",
    surface: "#ffffff",
    surfaceElevated: "#ffffff",

    // Brand colors
    primary: "#4CAF72",
    accent: "#F5A623",
    danger: "#E05C5C",

    // Text
    text: "#000000",
    textSecondary: "#666666",

    // UI elements
    tint: tintColorLight,
    tabIconDefault: "#999999",
    tabIconSelected: tintColorLight,
    divider: "#e0e0e0",
  },
  dark: {
    // Primary backgrounds - deep forest green for outdoor visibility
    background: "#0D1B12",
    surface: "#162518",
    surfaceElevated: "#1E3320",

    // Brand colors
    primary: "#4CAF72",
    accent: "#F5A623",
    danger: "#E05C5C",

    // Text
    text: "#F0F5F1",
    textSecondary: "#8BA690",

    // UI elements
    tint: tintColorDark,
    tabIconDefault: "#8BA690",
    tabIconSelected: "#4CAF72",
    divider: "#253C29",
  },
};
