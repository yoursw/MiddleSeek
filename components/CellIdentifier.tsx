import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { MaterialIcons } from '@expo/vector-icons';
import { CellIdentificationService, CellIdentificationResult } from '../services/CellIdentificationService';

export const CellIdentifier: React.FC = () => {
  const [image, setImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<CellIdentificationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const cellService = new CellIdentificationService({
    apiKey: process.env.EXPO_PUBLIC_CELL_API_KEY || '',
    apiEndpoint: process.env.EXPO_PUBLIC_CELL_API_ENDPOINT || '',
  });

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        setError('Sorry, we need camera roll permissions to make this work!');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
        base64: true,
      });

      if (!result.canceled && result.assets[0].base64) {
        setImage(result.assets[0].uri);
        setError(null);
        setIsLoading(true);

        try {
          const identificationResult = await cellService.identifyCell(result.assets[0].base64);
          setResult(identificationResult);
        } catch (error) {
          setError('Failed to identify cell. Please try again.');
          console.error('Cell identification error:', error);
        } finally {
          setIsLoading(false);
        }
      }
    } catch (error) {
      setError('An error occurred while accessing the image library.');
      console.error('Image picker error:', error);
    }
  };

  const renderCharacteristics = (characteristics: string[]) => {
    return (
      <View style={styles.characteristicsContainer}>
        <Text style={styles.characteristicsTitle}>Key Characteristics:</Text>
        {characteristics.map((characteristic, index) => (
          <Text key={index} style={styles.characteristicItem}>
            • {characteristic}
          </Text>
        ))}
      </View>
    );
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Cell Identifier</Text>
      <Text style={styles.subtitle}>Upload an image of a cell for identification</Text>

      {error && (
        <Text style={styles.errorText}>{error}</Text>
      )}

      {!image ? (
        <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
          <MaterialIcons name="add-photo-alternate" size={50} color="#666" />
          <Text style={styles.uploadText}>Select Image</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.imageContainer}>
          <Image source={{ uri: image }} style={styles.image} />
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#0000ff" />
              <Text style={styles.loadingText}>Analyzing image...</Text>
            </View>
          ) : result ? (
            <View style={styles.resultContainer}>
              <Text style={styles.resultTitle}>Identification Result:</Text>
              <Text style={styles.cellType}>{result.cellType}</Text>
              <Text style={styles.confidence}>
                Confidence: {(result.confidence * 100).toFixed(1)}%
              </Text>
              <Text style={styles.description}>{result.description}</Text>
              {result.characteristics && renderCharacteristics(result.characteristics)}
              <TouchableOpacity 
                style={styles.newImageButton} 
                onPress={() => {
                  setImage(null);
                  setResult(null);
                  setError(null);
                }}
              >
                <Text style={styles.newImageButtonText}>Analyze New Image</Text>
              </TouchableOpacity>
            </View>
          ) : null}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 20,
  },
  uploadButton: {
    borderWidth: 2,
    borderColor: '#ddd',
    borderStyle: 'dashed',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    height: 200,
  },
  uploadText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  imageContainer: {
    marginTop: 20,
  },
  image: {
    width: '100%',
    height: 300,
    borderRadius: 10,
  },
  loadingContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  resultContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#f8f8f8',
    borderRadius: 10,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  cellType: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2196F3',
    marginBottom: 5,
  },
  confidence: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 15,
  },
  characteristicsContainer: {
    marginTop: 10,
  },
  characteristicsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  characteristicItem: {
    fontSize: 14,
    lineHeight: 20,
    marginLeft: 10,
    marginBottom: 5,
  },
  newImageButton: {
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 8,
    marginTop: 20,
    alignItems: 'center',
  },
  newImageButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 