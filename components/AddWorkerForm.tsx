
import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Alert } from 'react-native';
import { colors } from '../styles/commonStyles';
import Button from './Button';

interface AddWorkerFormProps {
  onAddWorker: (name: string) => void;
}

export default function AddWorkerForm({ onAddWorker }: AddWorkerFormProps) {
  const [workerName, setWorkerName] = useState('');

  const handleAddWorker = () => {
    const trimmedName = workerName.trim();
    if (!trimmedName) {
      Alert.alert('Error', 'Please enter a worker name');
      return;
    }
    
    if (trimmedName.length < 2) {
      Alert.alert('Error', 'Worker name must be at least 2 characters long');
      return;
    }

    onAddWorker(trimmedName);
    setWorkerName('');
    console.log('Adding worker:', trimmedName);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Add New Worker</Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={workerName}
          onChangeText={setWorkerName}
          placeholder="Enter worker name"
          placeholderTextColor={colors.grey}
          maxLength={50}
          autoCapitalize="words"
          returnKeyType="done"
          onSubmitEditing={handleAddWorker}
        />
        <Button
          text="Add Worker"
          onPress={handleAddWorker}
          style={styles.addButton}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.backgroundAlt,
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
    elevation: 2,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  input: {
    flex: 1,
    backgroundColor: colors.background,
    borderColor: colors.grey,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: colors.text,
    minHeight: 44,
  },
  addButton: {
    flex: 0,
    minWidth: 100,
    marginTop: 0,
  },
});
