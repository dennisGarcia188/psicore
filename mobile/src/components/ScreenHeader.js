import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Brain, User } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

export default function ScreenHeader({ title, showProfile = true }) {
  const navigation = useNavigation();

  return (
    <LinearGradient 
      colors={['#F0F9FF', '#E0F2FE', '#FFFFFF']} 
      style={styles.container}
    >
      <View style={styles.topRow}>
        <View style={styles.logoContainer}>
          <Brain size={24} color="#0284C7" strokeWidth={2.5} />
        </View>
        
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{title}</Text>
        </View>

        {showProfile ? (
          <TouchableOpacity 
            style={styles.profileBtn}
            onPress={() => navigation.navigate('Menu')}
          >
            <User size={20} color="#0284C7" />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 40 }} />
        )}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logoContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  profileBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
});
