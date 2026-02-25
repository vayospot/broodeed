import Text from "@/components/Text";
import tw from "@/lib/tailwind";
import { Link, Stack } from "expo-router";
import { View } from "react-native";

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "Oops!" }} />
      <View style={tw`flex-1 items-center justify-center p-5`}>
        <Text style={tw`text-xl font-bold`}>This screen does not exist.</Text>

        <Link href="/" style={tw`mt-4 py-4`}>
          <Text style={tw`text-sm`}>Go to home screen!</Text>
        </Link>
      </View>
    </>
  );
}
