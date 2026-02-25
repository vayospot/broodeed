import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { useAppStore } from '@/stores/useAppStore';
import tw from 'twrnc';
import type { FlockType } from '@/types';

export default function FlocksScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];
  const router = useRouter();
  
  const { flocks, addFlock, deleteFlock, canAddFlock, premium } = useAppStore();
  const [showAddModal, setShowAddModal] = useState(false);
  const [newFlock, setNewFlock] = useState({
    name: '',
    type: 'broiler' as FlockType,
    breed: '',
    startDate: new Date().toISOString().split('T')[0],
    initialCount: '',
    costPerBird: '',
  });
  
  const activeFlocks = flocks.filter(f => f.status === 'active');
  
  const handleAddFlock = () => {
    if (!newFlock.name.trim()) {
      Alert.alert('Error', 'Please enter a flock name');
      return;
    }
    if (!newFlock.initialCount || parseInt(newFlock.initialCount) <= 0) {
      Alert.alert('Error', 'Please enter a valid bird count');
      return;
    }
    if (!newFlock.costPerBird || parseFloat(newFlock.costPerBird) <= 0) {
      Alert.alert('Error', 'Please enter a valid cost per bird');
      return;
    }
    
    if (!canAddFlock()) {
      Alert.alert(
        'Premium Required',
        'You can only have 5 active flocks on the free plan. Upgrade to premium for unlimited flocks.',
        [{ text: 'OK' }]
      );
      return;
    }
    
    addFlock({
      name: newFlock.name.trim(),
      type: newFlock.type,
      breed: newFlock.breed.trim() || undefined,
      startDate: newFlock.startDate,
      initialCount: parseInt(newFlock.initialCount),
      costPerBird: parseFloat(newFlock.costPerBird),
      status: 'active',
    });
    
    setShowAddModal(false);
    setNewFlock({
      name: '',
      type: 'broiler',
      breed: '',
      startDate: new Date().toISOString().split('T')[0],
      initialCount: '',
      costPerBird: '',
    });
  };
  
  const handleDeleteFlock = (id: string, name: string) => {
    Alert.alert(
      'Delete Flock',
      `Are you sure you want to delete "${name}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteFlock(id) },
      ]
    );
  };
  
  return (
    <View style={[tw`flex-1`, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={tw`p-4`}>
        {/* Header */}
        <View style={tw`flex-row justify-between items-center mb-6`}>
          <View>
            <Text style={[tw`text-2xl font-bold`, { color: colors.text }]}>Flocks</Text>
            <Text style={[tw`text-sm`, { color: colors.textSecondary }]}>
              {activeFlocks.length}/5 flocks {premium.isPremium ? '(Premium)' : ''}
            </Text>
          </View>
          
          <TouchableOpacity
            style={[tw`w-12 h-12 rounded-full items-center justify-center`, { backgroundColor: colors.primary }]}
            onPress={() => setShowAddModal(true)}
          >
            <Ionicons name="add" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
        
        {/* Flocks List */}
        {activeFlocks.length === 0 ? (
          <View style={[tw`p-8 rounded-xl items-center`, { backgroundColor: colors.surface }]}>
            <Ionicons name="egg-outline" size={64} color={colors.textSecondary} />
            <Text style={[tw`text-lg font-semibold mt-4`, { color: colors.text }]}>
              No flocks yet
            </Text>
            <Text style={[tw`text-center mt-2`, { color: colors.textSecondary }]}>
              Add your first flock to start tracking{'\n'}your poultry operations
            </Text>
            <TouchableOpacity
              style={[tw`mt-6 px-6 py-3 rounded-full`, { backgroundColor: colors.primary }]}
              onPress={() => setShowAddModal(true)}
            >
              <Text style={[tw`font-semibold`, { color: colors.text }]}>Add First Flock</Text>
            </TouchableOpacity>
          </View>
        ) : (
          activeFlocks.map((flock) => {
            const daysOld = Math.floor((Date.now() - new Date(flock.startDate).getTime()) / (1000 * 60 * 60 * 24));
            
            return (
              <TouchableOpacity
                key={flock.id}
                style={[tw`p-4 rounded-xl mb-3`, { backgroundColor: colors.surface }]}
                onPress={() => router.push(`/flock/${flock.id}`)}
              >
                <View style={tw`flex-row items-center`}>
                  <View style={[tw`w-12 h-12 rounded-full items-center justify-center`, { backgroundColor: colors.primary + '30' }]}>
                    <Ionicons 
                      name={flock.type === 'layer' ? 'egg' : 'restaurant'} 
                      size={24} 
                      color={colors.primary} 
                    />
                  </View>
                  
                  <View style={tw`flex-1 ml-3`}>
                    <Text style={[tw`text-lg font-semibold`, { color: colors.text }]}>
                      {flock.name}
                    </Text>
                    <Text style={[tw`text-sm`, { color: colors.textSecondary }]}>
                      Day {daysOld} • {flock.initialCount} birds • {flock.type}
                    </Text>
                  </View>
                  
                  <TouchableOpacity
                    style={tw`p-2`}
                    onPress={() => handleDeleteFlock(flock.id, flock.name)}
                  >
                    <Ionicons name="trash-outline" size={20} color={colors.danger} />
                  </TouchableOpacity>
                  
                  <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
      
      {/* Add Flock Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={[tw`flex-1`, { backgroundColor: colors.background }]}>
          <View style={[tw`p-4 border-b`, { borderColor: colors.divider }]}>
            <View style={tw`flex-row justify-between items-center`}>
              <Text style={[tw`text-xl font-bold`, { color: colors.text }]}>New Flock</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
          </View>
          
          <ScrollView contentContainerStyle={tw`p-4`}>
            {/* Name */}
            <Text style={[tw`text-sm font-medium mb-2`, { color: colors.text }]}>Flock Name *</Text>
            <TextInput
              style={[tw`p-4 rounded-xl mb-4`, { backgroundColor: colors.surface, color: colors.text }]}
              placeholder="e.g., Batch 1, Broiler A"
              placeholderTextColor={colors.textSecondary}
              value={newFlock.name}
              onChangeText={(text) => setNewFlock({ ...newFlock, name: text })}
            />
            
            {/* Type */}
            <Text style={[tw`text-sm font-medium mb-2`, { color: colors.text }]}>Type *</Text>
            <View style={tw`flex-row gap-2 mb-4`}>
              {(['broiler', 'layer', 'dual'] as FlockType[]).map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[tw`flex-1 p-3 rounded-xl`, { 
                    backgroundColor: newFlock.type === type ? colors.primary : colors.surface 
                  }]}
                  onPress={() => setNewFlock({ ...newFlock, type })}
                >
                  <Text style={[tw`text-center font-medium capitalize`, { 
                    color: newFlock.type === type ? colors.text : colors.textSecondary 
                  }]}>
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            
            {/* Breed */}
            <Text style={[tw`text-sm font-medium mb-2`, { color: colors.text }]}>Breed (Optional)</Text>
            <TextInput
              style={[tw`p-4 rounded-xl mb-4`, { backgroundColor: colors.surface, color: colors.text }]}
              placeholder="e.g., Ross 308, Arbor Acres"
              placeholderTextColor={colors.textSecondary}
              value={newFlock.breed}
              onChangeText={(text) => setNewFlock({ ...newFlock, breed: text })}
            />
            
            {/* Start Date */}
            <Text style={[tw`text-sm font-medium mb-2`, { color: colors.text }]}>Start Date *</Text>
            <TextInput
              style={[tw`p-4 rounded-xl mb-4`, { backgroundColor: colors.surface, color: colors.text }]}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={colors.textSecondary}
              value={newFlock.startDate}
              onChangeText={(text) => setNewFlock({ ...newFlock, startDate: text })}
            />
            
            {/* Initial Count */}
            <Text style={[tw`text-sm font-medium mb-2`, { color: colors.text }]}>Initial Bird Count *</Text>
            <TextInput
              style={[tw`p-4 rounded-xl mb-4`, { backgroundColor: colors.surface, color: colors.text }]}
              placeholder="e.g., 500"
              placeholderTextColor={colors.textSecondary}
              keyboardType="numeric"
              value={newFlock.initialCount}
              onChangeText={(text) => setNewFlock({ ...newFlock, initialCount: text })}
            />
            
            {/* Cost Per Bird */}
            <Text style={[tw`text-sm font-medium mb-2`, { color: colors.text }]}>Cost Per Bird ($) *</Text>
            <TextInput
              style={[tw`p-4 rounded-xl mb-6`, { backgroundColor: colors.surface, color: colors.text }]}
              placeholder="e.g., 1.50"
              placeholderTextColor={colors.textSecondary}
              keyboardType="decimal-pad"
              value={newFlock.costPerBird}
              onChangeText={(text) => setNewFlock({ ...newFlock, costPerBird: text })}
            />
            
            {/* Add Button */}
            <TouchableOpacity
              style={[tw`p-4 rounded-xl items-center`, { backgroundColor: colors.primary }]}
              onPress={handleAddFlock}
            >
              <Text style={[tw`text-lg font-bold`, { color: colors.text }]}>Add Flock</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}
