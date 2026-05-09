import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity, Linking, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Phone, MessageCircle, Plus } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import api from '../api';
import ScreenHeader from '../components/ScreenHeader';

export default function PatientsList({ navigation }) {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const res = await api.get('/patients/');
      setPatients(res.data);
    } catch (err) {
      console.error(err);
      Alert.alert('Erro', 'Não foi possível carregar os pacientes.');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchPatients();
    }, [])
  );

  const openWhatsApp = (phone) => {
    if (!phone) return;
    const number = phone.replace(/\D/g, '');
    Linking.openURL(`whatsapp://send?phone=55${number}`);
  };

  const openPhone = (phone) => {
    if (!phone) return;
    const number = phone.replace(/\D/g, '');
    Linking.openURL(`tel:${number}`);
  };

  const renderItem = ({ item }) => {
    return (
      <TouchableOpacity 
        style={styles.card} 
        activeOpacity={0.7}
        onPress={() => navigation.navigate('PatientDetails', { patientId: item.id })}
      >
        <View style={styles.avatarPlaceholder}>
          <Text style={styles.avatarText}>{item.name.charAt(0).toUpperCase()}</Text>
        </View>
        <View style={styles.cardContent}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.phone}>{item.phone || 'Sem telefone'}</Text>
        </View>
        <View style={styles.actions}>
          {item.phone && (
            <>
              <TouchableOpacity onPress={() => openPhone(item.phone)} style={styles.iconButton}>
                <Phone size={20} color="#0284C7" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => openWhatsApp(item.phone)} style={[styles.iconButton, { backgroundColor: '#DCFCE7' }]}>
                <MessageCircle size={20} color="#16A34A" />
              </TouchableOpacity>
            </>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <ScreenHeader title="Pacientes" />

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#0284C7" />
        </View>
      ) : (
        <FlatList
          data={patients}
          keyExtractor={item => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <Text style={styles.emptyText}>Nenhum paciente cadastrado.</Text>
          }
        />
      )}

      <TouchableOpacity 
        style={styles.fab} 
        onPress={() => navigation.navigate('NewPatient')}
        activeOpacity={0.8}
      >
        <Plus size={24} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list: { padding: 16, paddingBottom: 100 },
  card: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#F0F9FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  avatarText: { fontSize: 20, fontWeight: '800', color: '#0284C7' },
  cardContent: { flex: 1 },
  name: { fontSize: 17, fontWeight: '800', color: '#0F172A', marginBottom: 4 },
  phone: { fontSize: 14, color: '#64748B', fontWeight: '500' },
  actions: { flexDirection: 'row', gap: 8 },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#F0F9FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: { textAlign: 'center', color: '#94A3B8', marginTop: 60, fontSize: 16, fontWeight: '500' },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#0284C7',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0284C7',
    shadowOpacity: 0.4,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  }
});
