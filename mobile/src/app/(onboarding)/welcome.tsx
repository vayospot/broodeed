import Text from "@/components/Text";
import tw from "@/lib/tailwind";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { TouchableOpacity, View } from "react-native";

export default function WelcomeScreen() {
  const router = useRouter();

  const handleGetStarted = () => {
    router.push("/(onboarding)/farm");
  };

  return (
    <View style={tw`flex-1 bg-deep px-6 pb-10 justify-between`}>
      {/* Main Content */}
      <View style={tw`flex-1 justify-center items-center`}>
        {/* Hero Icon */}
        <View
          style={tw`w-32 h-32 rounded-full bg-surface items-center justify-center mb-8`}
        >
          <Ionicons name="egg" size={64} color="#4CAF72" />
        </View>

        <Text style={tw`text-3xl font-bold text-primary text-center mb-4`}>
          Track every bird.
        </Text>
        <Text style={tw`text-3xl font-bold text-primary text-center`}>
          Every egg. Every Profit.
        </Text>
      </View>

      {/* Footer with CTA */}
      <View style={tw`gap-4`}>
        <TouchableOpacity
          style={tw`h-14 bg-brand-amber rounded-xl items-center justify-center shadow-lg`}
          onPress={handleGetStarted}
          activeOpacity={0.8}
        >
          <Text style={tw`text-lg font-semibold text-deep`}>Get Started</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
