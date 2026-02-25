import OnboardingProgress from "@/components/OnboardingProgress";
import Text from "@/components/Text";
import tw from "@/lib/tailwind";
import { useRouter } from "expo-router";
import { TouchableOpacity, View } from "react-native";

export default function WelcomeScreen() {
  const router = useRouter();

  const handleGetStarted = () => {
    router.push("/(onboarding)/farm");
  };

  return (
    <View style={tw`flex-1 bg-deep px-6 pt-20 pb-10 justify-between`}>
      {/* Header with dots */}
      <View style={tw`mb-8`}>
        <OnboardingProgress totalSteps={3} currentStep={0} />
      </View>

      {/* Main Content */}
      <View style={tw`flex-1 justify-center items-center`}>
        {/* Illustration placeholder - chicken icon */}
        <View
          style={tw`w-32 h-32 rounded-full bg-surface items-center justify-center mb-8`}
        >
          <Text style={tw`text-6xl`}>🐔</Text>
        </View>

        <Text style={tw`text-3xl font-bold text-primary text-center mb-4`}>
          Track every bird.
        </Text>
        <Text style={tw`text-3xl font-bold text-primary text-center mb-4`}>
          Every egg. Every naira.
        </Text>

        <Text style={tw`text-base text-secondary text-center mt-4`}>
          Your farm runs on data.
        </Text>
        <Text style={tw`text-base text-secondary text-center`}>
          Broodeed makes it easy.
        </Text>
      </View>

      {/* Footer with CTA */}
      <View style={tw`gap-4`}>
        <TouchableOpacity
          style={tw`h-14 bg-brand-amber rounded-xl items-center justify-center shadow-lg`}
          onPress={handleGetStarted}
          activeOpacity={0.8}
        >
          <Text style={tw`text-lg font-semibold text-deep`}>Get Started →</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
