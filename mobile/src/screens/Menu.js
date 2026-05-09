import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, SafeAreaView, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, LogOut, ChevronRight, Settings, Building2 } from 'lucide-react-native';
import { useFocusEffect } from '@react-navigation/native';
import api from '../api';
import ScreenHeader from '../components/ScreenHeader';

export default function Menu({ navigation }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await api.get('/auth/me');
      setProfile(res.data);
    } catch (err) {
      console.error(err);
      Alert.alert('Erro', 'Não foi possível carregar os dados do perfil.');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchProfile();
    }, [])
  );

  const handleLogout = async () => {
    Alert.alert(
      'Sair do App',
      'Tem certeza que deseja desconectar sua conta?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Sair', 
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.removeItem('token');
            navigation.replace('Login');
          }
        }
      ]
    );
  };

  if (loading && !profile) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0284C7" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScreenHeader title="Menu" showProfile={false} />

      <ScrollView style={styles.content}>
        <View style={styles.profileCard}>
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarText}>{profile?.name ? profile.name.charAt(0).toUpperCase() : 'P'}</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.name}>{profile?.name || 'Psicólogo'}</Text>
            <Text style={styles.email}>{profile?.email}</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>CRP: {profile?.crp || 'Não informado'}</Text>
            </View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Configurações</Text>
        
        <View style={styles.menuGroup}>
          <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('ClinicData')}>
            <View style={styles.menuIconBox}>
              <Building2 size={20} color="#0284C7" />
            </View>
            <Text style={styles.menuText}>Dados do Consultório</Text>
            <ChevronRight size={20} color="#CBD5E1" />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.menuItem} onPress={() => Alert.alert('Aviso', 'Funcionalidade na web.')}>
            <View style={[styles.menuIconBox, { backgroundColor: '#F1F5F9' }]}>
              <Settings size={20} color="#475569" />
            </View>
            <Text style={styles.menuText}>Preferências do App</Text>
            <ChevronRight size={20} color="#CBD5E1" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <LogOut size={20} color="#EF4444" />
          <Text style={styles.logoutText}>Sair da Conta</Text>
        </TouchableOpacity>
        
        <Text style={styles.versionText}>PsiCore Mobile v2.0</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  content: { padding: 16 },
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  avatarPlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#0284C7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  avatarText: { fontSize: 28, fontWeight: '800', color: '#FFFFFF' },
  profileInfo: { flex: 1 },
  name: { fontSize: 18, fontWeight: '800', color: '#0F172A', marginBottom: 4 },
  email: { fontSize: 14, color: '#64748B', marginBottom: 8 },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: '#F0F9FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: { fontSize: 12, fontWeight: '700', color: '#0284C7' },
  sectionTitle: { fontSize: 14, fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12, marginLeft: 8 },
  menuGroup: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  menuIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F0F9FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  menuText: { flex: 1, fontSize: 16, fontWeight: '600', color: '#334155' },
  divider: { height: 1, backgroundColor: '#F1F5F9', marginLeft: 72 },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF2F2',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FEE2E2',
    gap: 8,
  },
  logoutText: { fontSize: 16, fontWeight: '700', color: '#EF4444' },
  versionText: { textAlign: 'center', marginTop: 32, fontSize: 12, color: '#94A3B8', fontWeight: '500' }
});
