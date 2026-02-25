import { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, TextInput, Dimensions, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { useAppStore } from '@/stores/useAppStore';
import tw from 'twrnc';

const { width } = Dimensions.get('window');

export default function LogScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];
  const router = useRouter();
  
  const { getActiveFlocks, addDailyLog, getDailyLog, updateDailyLog } = useAppStore();
  const activeFlocks = getActiveFlocks();
  
  const [selectedFlockId, setSelectedFlockId] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const scrollRef = useRef<ScrollView>(null);
  
  const today = new Date().toISOString().split('T')[0];
  
  const [formData, setFormData] = useState({
    deaths: 0,
    feedConsumedKg: '',
    eggsCollected: 0,
    eggsDamaged: 0,
    birdCount: 0,
  });
  
  const selectedFlock = activeFlocks.find(f => f.id === selectedFlockId);
  const existingLog = selectedFlockId ? getDailyLog(selectedFlockId, today) : null;
  
  const steps = [
    { title: 'Mortality', subtitle: 'Birds that died today', icon: 'warning' },
    { title: 'Feed', subtitle: 'Feed used (kg)', icon: 'leaf' },
    ...(selectedFlock?.type === 'layer' ? [{ title: 'Eggs', subtitle: 'Eggs collected', icon: 'egg' }] : []),
    { title: 'Bird Count', subtitle: 'Total birds alive', icon: 'people' },
  ];
  
  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
      scrollRef.current?.scrollTo({ x: (currentStep + 1) * width, animated: true });
    }
  };
  
  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      scrollRef.current?.scrollTo({ x: (currentStep - 1) * width, animated: true });
    }
  };
  
  const handleSave = () => {
    if (!selectedFlockId) {
      Alert.alert('Error', 'Please select a flock');
      return;
    }
    
    const data = {
      flockId: selectedFlockId,
      logDate: today,
      birdCount: formData.birdCount - formData.deaths,
      deaths: formData.deaths,
      feedConsumedKg: parseFloat(formData.feedConsumedKg) || 0,
      eggsCollected: selectedFlock?.type === 'layer' ? formData.eggsCollected : undefined,
      eggsDamaged: selectedFlock?.type === 'layer' ? formData.eggsDamaged : undefined,
    };
    
    if (existingLog) {
      updateDailyLog(existingLog.id, data);
    } else {
      addDailyLog(data);
    }
    
    Alert.alert('Success', 'Daily log saved!', [
      { text: 'OK', onPress: () => router.back() }
    ]);
  };
  
  if (!selectedFlockId) {
    return (
      <View style={[tw`flex-1`, { backgroundColor: colors.background }]}>
        <View style={[tw`p-4 border-b`, { borderColor: colors.divider }]}>
          <TouchableOpacity onPress={() => router.back()} style={tw`flex-row items-center`}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
            <Text style={[tw`ml-2 text-lg font-bold`, { color: colors.text }]}>Select Flock</Text>
          </TouchableOpacity>
        </View>
        
        <ScrollView contentContainerStyle={tw`p-4`}>
          <Text style={[tw`text-sm mb-4`, { color: colors.textSecondary }]}>
            Which flock are you logging today?
          </Text>
          
          {activeFlocks.map((flock) => {
            const log = getDailyLog(flock.id, today);
            return (
              <TouchableOpacity
                key={flock.id}
                style={[tw`p-4 rounded-xl mb-3`, { backgroundColor: colors.surface }]}
                onPress={() => setSelectedFlockId(flock.id)}
              >
                <View style={tw`flex-row items-center`}>
                  <View style={[tw`w-12 h-12 rounded-full items-center justify-center`, { backgroundColor: colors.primary + '30' }]}>
                    <Ionicons name={flock.type === 'layer' ? 'egg' : 'restaurant'} size={24} color={colors.primary} />
                  </View>
                  <View style={tw`flex-1 ml-3`}>
                    <Text style={[tw`text-lg font-semibold`, { color: colors.text }]}>{flock.name}</Text>
                    <Text style={[tw`text-sm`, { color: colors.textSecondary }]}>{flock.type} • {flock.initialCount} birds</Text>
                  </View>
                  {log && (
                    <View style={[tw`px-2 py-1 rounded-full`, { backgroundColor: colors.primary + '30' }]}>
                      <Text style={[tw`text-xs`, { color: colors.primary }]}>Logged</Text>
                    </View>
                  )}
                  <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    );
  }
  
  return (
    <View style={[tw`flex-1`, { backgroundColor: colors.background }]}>
      <View style={[tw`p-4 border-b`, { borderColor: colors.divider }]}>
        <View style={tw`flex-row items-center justify-between`}>
          <TouchableOpacity onPress={() => router.back()} style={tw`flex-row items-center`}>
            <Ionicons name="close" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[tw`font-bold`, { color: colors.text }]}>{selectedFlock?.name}</Text>
          <View style={tw`w-8`} />
        </View>
        
        <View style={tw`flex-row justify-center mt-4 gap-2`}>
          {steps.map((_, index) => (
            <View key={index} style={[tw`h-1 rounded-full`, { 
              width: index === currentStep ? 24 : 8,
              backgroundColor: index <= currentStep ? colors.primary : colors.divider 
            }]} />
          ))}
        </View>
      </View>
      
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEnabled={false}
        contentContainerStyle={{ width: width * steps.length }}
      >
        <View style={[tw`flex-1 items-center justify-center px-6`, { width }]}>
          <View style={[tw`w-20 h-20 rounded-full items-center justify-center mb-6`, { backgroundColor: colors.danger + '30' }]}>
            <Ionicons name="warning" size={40} color={colors.danger} />
          </View>
          <Text style={[tw`text-2xl font-bold mb-2`, { color: colors.text }]}>{steps[0].title}</Text>
          <Text style={[tw`text-center mb-8`, { color: colors.textSecondary }]}>{steps[0].subtitle}</Text>
          
          <View style={tw`flex-row items-center gap-4`}>
            <TouchableOpacity style={[tw`w-20 h-20 rounded-2xl items-center justify-center`, { backgroundColor: colors.surface }]}
              onPress={() => setFormData({ ...formData, deaths: Math.max(0, formData.deaths - 1) })}>
              <Ionicons name="remove" size={32} color={colors.text} />
            </TouchableOpacity>
            <Text style={[tw`text-6xl font-bold w-32 text-center`, { color: colors.text }]}>{formData.deaths}</Text>
            <TouchableOpacity style={[tw`w-20 h-20 rounded-2xl items-center justify-center`, { backgroundColor: colors.surface }]}
              onPress={() => setFormData({ ...formData, deaths: formData.deaths + 1 })}>
              <Ionicons name="add" size={32} color={colors.text} />
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={[tw`flex-1 items-center justify-center px-6`, { width }]}>
          <View style={[tw`w-20 h-20 rounded-full items-center justify-center mb-6`, { backgroundColor: colors.primary + '30' }]}>
            <Ionicons name="leaf" size={40} color={colors.primary} />
          </View>
          <Text style={[tw`text-2xl font-bold mb-2`, { color: colors.text }]}>{steps[1].title}</Text>
          <Text style={[tw`text-center mb-8`, { color: colors.textSecondary }]}>{steps[1].subtitle}</Text>
          
          <TextInput
            style={[tw`text-5xl font-bold text-center p-4 rounded-2xl w-48`, { backgroundColor: colors.surface, color: colors.text }]}
            placeholder="0"
            placeholderTextColor={colors.textSecondary}
            keyboardType="decimal-pad"
            value={formData.feedConsumedKg}
            onChangeText={(text) => setFormData({ ...formData, feedConsumedKg: text })}
          />
          <Text style={[tw`mt-4`, { color: colors.textSecondary }]}>kg</Text>
        </View>
        
        {selectedFlock?.type === 'layer' && (
          <View style={[tw`flex-1 items-center justify-center px-6`, { width }]}>
            <View style={[tw`w-20 h-20 rounded-full items-center justify-center mb-6`, { backgroundColor: colors.accent + '30' }]}>
              <Ionicons name="egg" size={40} color={colors.accent} />
            </View>
            <Text style={[tw`text-2xl font-bold mb-2`, { color: colors.text }]}>{steps[2].title}</Text>
            <Text style={[tw`text-center mb-8`, { color: colors.textSecondary }]}>{steps[2].subtitle}</Text>
            
            <View style={tw`flex-row items-center gap-4`}>
              <TouchableOpacity style={[tw`w-20 h-20 rounded-2xl items-center justify-center`, { backgroundColor: colors.surface }]}
                onPress={() => setFormData({ ...formData, eggsCollected: Math.max(0, formData.eggsCollected - 1) })}>
                <Ionicons name="remove" size={32} color={colors.text} />
              </TouchableOpacity>
              <Text style={[tw`text-6xl font-bold w-32 text-center`, { color: colors.text }]}>{formData.eggsCollected}</Text>
              <TouchableOpacity style={[tw`w-20 h-20 rounded-2xl items-center justify-center`, { backgroundColor: colors.surface }]}
                onPress={() => setFormData({ ...formData, eggsCollected: formData.eggsCollected + 1 })}>
                <Ionicons name="add" size={32} color={colors.text} />
              </TouchableOpacity>
            </View>
          </View>
        )}
        
        <View style={[tw`flex-1 items-center justify-center px-6`, { width }]}>
          <View style={[tw`w-20 h-20 rounded-full items-center justify-center mb-6`, { backgroundColor: colors.primary + '30' }]}>
            <Ionicons name="people" size={40} color={colors.primary} />
          </View>
          <Text style={[tw`text-2xl font-bold mb-2`, { color: colors.text }]}>{steps[steps.length - 1].title}</Text>
          <Text style={[tw`text-center mb-8`, { color: colors.textSecondary }]}>{steps[steps.length - 1].subtitle}</Text>
          
          <View style={tw`flex-row items-center gap-4`}>
            <TouchableOpacity style={[tw`w-20 h-20 rounded-2xl items-center justify-center`, { backgroundColor: colors.surface }]}
              onPress={() => setFormData({ ...formData, birdCount: Math.max(0, formData.birdCount - 10) })}>
              <Ionicons name="remove" size={32} color={colors.text} />
            </TouchableOpacity>
            <Text style={[tw`text-6xl font-bold w-40 text-center`, { color: colors.text }]}>{formData.birdCount}</Text>
            <TouchableOpacity style={[tw`w-20 h-20 rounded-2xl items-center justify-center`, { backgroundColor: colors.surface }]}
              onPress={() => setFormData({ ...formData, birdCount: formData.birdCount + 10 })}>
              <Ionicons name="add" size={32} color={colors.text} />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
      
      <View style={[tw`p-4 border-t`, { borderColor: colors.divider }]}>
        <View style={tw`flex-row justify-between`}>
          {currentStep > 0 ? (
            <TouchableOpacity style={[tw`px-6 py-4 rounded-xl`, { backgroundColor: colors.surface }]} onPress={handlePrev}>
              <Text style={[tw`font-medium`, { color: colors.text }]}>Back</Text>
            </TouchableOpacity>
          ) : <View />}
          
          {currentStep < steps.length - 1 ? (
            <TouchableOpacity style={[tw`px-8 py-4 rounded-xl`, { backgroundColor: colors.primary }]} onPress={handleNext}>
              <Text style={[tw`font-bold`, { color: colors.text }]}>Next</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={[tw`px-8 py-4 rounded-xl`, { backgroundColor: colors.primary }]} onPress={handleSave}>
              <Text style={[tw`font-bold`, { color: colors.text }]}>Save</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}
