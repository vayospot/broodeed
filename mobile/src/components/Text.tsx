import tw from "@/lib/tailwind";
import { Text as RNText, TextProps as RNTextProps } from "react-native";

export default function Text({ style, children, ...props }: RNTextProps) {
  return (
    <RNText {...props} style={[tw`font-inter`, style]}>
      {children}
    </RNText>
  );
}
