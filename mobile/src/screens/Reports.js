import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { BarChart2, Users, Calendar, CheckCircle, Clock, XCircle } from 'lucide-react-native';
import api from '../api';
import ScreenHeader from '../components/ScreenHeader';

export default function Reports() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const [pRes, aRes] = await Promise.all([
        api.get('/patients/'),
        api.get('/appointments/')
      ]);

      const patients = pRes.data;
      const appointments = aRes.data;

      const confirmed = appointments.filter(a => a.status === 'Confirmada').length;
      const pending = appointments.filter(a => a.status === 'Aguardando Confirmação').length;
      const canceled = appointments.filter(a => a.status === 'Cancelada').length;
      const total = appointments.length;

      setStats({
        totalPatients: patients.length,
        totalAppointments: total,
        confirmed,
        pending,
        canceled,
        conversion: total > 0 ? ((confirmed / total) * 100).toFixed(1) : 0
      });
    } catch (err) {
      console.error(err);
      Alert.alert('Erro', 'Não foi possível carregar as estatísticas.');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchStats();
    }, [])
  );

  const StatCard = ({ title, value, icon: Icon, color, bg }) => (
    <View style={styles.statCard}>
      <View style={[styles.iconBox, { backgroundColor: bg }]}>
        <Icon size={24} color={color} />
      </View>
      <View>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statTitle}>{title}</Text>
      </View>
    </View>
  );

  if (loading && !stats) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0284C7" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScreenHeader title="Relatórios" />
      
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Geral do Consultório</Text>
          <View style={styles.summaryGrid}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{stats?.totalPatients}</Text>
              <Text style={styles.summaryLabel}>Pacientes</Text>
            </View>
            <View style={styles.verticalDivider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{stats?.totalAppointments}</Text>
              <Text style={styles.summaryLabel}>Consultas</Text>
            </View>
            <View style={styles.verticalDivider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{stats?.conversion}%</Text>
              <Text style={styles.summaryLabel}>Efetividade</Text>
            </View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Status das Consultas</Text>
        
        <StatCard 
          title="Confirmadas" 
          value={stats?.confirmed} 
          icon={CheckCircle} 
          color="#16A34A" 
          bg="#DCFCE7" 
        />
        <StatCard 
          title="Aguardando Confirmação" 
          value={stats?.pending} 
          icon={Clock} 
          color="#F59E0B" 
          bg="#FEF3C7" 
        />
        <StatCard 
          title="Canceladas" 
          value={stats?.canceled} 
          icon={XCircle} 
          color="#EF4444" 
          bg="#FEF2F2" 
        />

        <View style={styles.infoBox}>
          <BarChart2 size={20} color="#0284C7" />
          <Text style={styles.infoText}>
            Mais relatórios detalhados e gráficos interativos estão disponíveis na versão web do PsiCore.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  content: { padding: 16 },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  summaryTitle: { fontSize: 16, fontWeight: '800', color: '#0F172A', marginBottom: 20, textAlign: 'center' },
  summaryGrid: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' },
  summaryItem: { alignItems: 'center' },
  summaryValue: { fontSize: 22, fontWeight: '900', color: '#0284C7', marginBottom: 4 },
  summaryLabel: { fontSize: 12, color: '#64748B', fontWeight: '600', textTransform: 'uppercase' },
  verticalDivider: { width: 1, height: 40, backgroundColor: '#F1F5F9' },
  sectionTitle: { fontSize: 14, fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12, marginLeft: 8 },
  statCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  iconBox: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  statValue: { fontSize: 20, fontWeight: '800', color: '#1E293B', marginBottom: 2 },
  statTitle: { fontSize: 14, color: '#64748B', fontWeight: '500' },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#F0F9FF',
    padding: 16,
    borderRadius: 16,
    marginTop: 24,
    gap: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0F2FE',
  },
  infoText: { flex: 1, fontSize: 13, color: '#0369A1', lineHeight: 18, fontWeight: '500' }
});
