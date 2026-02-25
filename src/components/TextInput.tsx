import tw from "@/lib/tailwind";
import {
  TextInput as RNTextInput,
  TextInputProps as RNTextInputProps,
} from "react-native";

export default function TextInput({ style, ...props }: RNTextInputProps) {
  return <RNTextInput {...props} style={[tw`font-inter`, style]} />;
}
