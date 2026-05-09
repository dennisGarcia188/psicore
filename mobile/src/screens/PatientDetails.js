import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { ChevronLeft, User, Calendar as CalendarIcon, FileText, Phone, Mail, FileDigit, CalendarDays } from 'lucide-react-native';
import api from '../api';

export default function PatientDetails({ route, navigation }) {
  const { patientId } = route.params;
  const [patient, setPatient] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dados'); // 'dados' | 'historico'

  const fetchData = async () => {
    try {
      setLoading(true);
      const [pRes, aRes] = await Promise.all([
        api.get(`/patients/${patientId}`),
        api.get(`/appointments/patient/${patientId}`)
      ]);
      setPatient(pRes.data);
      // Ordena consultas da mais recente para a mais antiga
      const sortedAppointments = aRes.data.sort((a, b) => new Date(b.date_time) - new Date(a.date_time));
      setAppointments(sortedAppointments);
    } catch (err) {
      console.error(err);
      Alert.alert('Erro', 'Falha ao carregar dados do paciente.');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [patientId])
  );

  const openWhatsApp = () => {
    if (!patient?.phone) return;
    const number = patient.phone.replace(/\D/g, '');
    Linking.openURL(`whatsapp://send?phone=55${number}`);
  };

  if (loading || !patient) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#0284C7" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeBtn}>
          <ChevronLeft color="#0F172A" size={28} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{patient.name}</Text>
        <View style={{ width: 28 }} />
      </View>

      {/* TABS */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'dados' && styles.activeTab]} 
          onPress={() => setActiveTab('dados')}
        >
          <User size={18} color={activeTab === 'dados' ? '#0284C7' : '#94A3B8'} />
          <Text style={[styles.tabText, activeTab === 'dados' && styles.activeTabText]}>Dados</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'historico' && styles.activeTab]} 
          onPress={() => setActiveTab('historico')}
        >
          <FileText size={18} color={activeTab === 'historico' ? '#0284C7' : '#94A3B8'} />
          <Text style={[styles.tabText, activeTab === 'historico' && styles.activeTabText]}>Histórico</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {activeTab === 'dados' ? (
          <View style={styles.card}>
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>{patient.name.charAt(0).toUpperCase()}</Text>
            </View>
            <Text style={styles.patientName}>{patient.name}</Text>
            
            <View style={styles.infoGroup}>
              <Phone size={18} color="#94A3B8" style={{ marginRight: 12 }} />
              <View>
                <Text style={styles.infoLabel}>Telefone</Text>
                <Text style={styles.infoValue}>{patient.phone || 'Não informado'}</Text>
              </View>
              {patient.phone && (
                <TouchableOpacity onPress={openWhatsApp} style={styles.actionBtnBtn}>
                  <Text style={{ color: '#16A34A', fontWeight: '700', fontSize: 13 }}>WhatsApp</Text>
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.infoGroup}>
              <Mail size={18} color="#94A3B8" style={{ marginRight: 12 }} />
              <View>
                <Text style={styles.infoLabel}>E-mail</Text>
                <Text style={styles.infoValue}>{patient.email || 'Não informado'}</Text>
              </View>
            </View>

            <View style={styles.infoGroup}>
              <FileDigit size={18} color="#94A3B8" style={{ marginRight: 12 }} />
              <View>
                <Text style={styles.infoLabel}>CPF</Text>
                <Text style={styles.infoValue}>{patient.cpf || 'Não informado'}</Text>
              </View>
            </View>

            <View style={[styles.infoGroup, { borderBottomWidth: 0 }]}>
              <CalendarDays size={18} color="#94A3B8" style={{ marginRight: 12 }} />
              <View>
                <Text style={styles.infoLabel}>Data de Nascimento</Text>
                <Text style={styles.infoValue}>
                  {patient.birth_date ? new Date(patient.birth_date).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : 'Não informado'}
                </Text>
              </View>
            </View>
          </View>
        ) : (
          <View style={{ paddingBottom: 40 }}>
            <Text style={styles.sectionTitle}>Sessões ({appointments.length})</Text>
            {appointments.length === 0 ? (
              <Text style={styles.emptyText}>Nenhuma sessão registrada para este paciente.</Text>
            ) : (
              appointments.map((appt) => {
                const apptDate = new Date(appt.date_time);
                return (
                  <TouchableOpacity 
                    key={appt.id} 
                    style={styles.appointmentCard}
                    onPress={() => navigation.navigate('AppointmentDetails', { appointment: { ...appt, patient_name: patient.name } })}
                  >
                    <View style={styles.apptHeader}>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <CalendarIcon size={16} color="#0284C7" style={{ marginRight: 8 }} />
                        <Text style={styles.apptDate}>
                          {apptDate.toLocaleDateString('pt-BR')} às {apptDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </Text>
                      </View>
                      <View style={[styles.statusBadge, { backgroundColor: getStatusColor(appt.status) + '20' }]}>
                        <Text style={[styles.statusText, { color: getStatusColor(appt.status) }]}>{appt.status}</Text>
                      </View>
                    </View>
                    {appt.notes ? (
                      <View style={styles.notesPreview}>
                        <Text style={styles.notesText} numberOfLines={3}>{appt.notes}</Text>
                      </View>
                    ) : (
                      <Text style={styles.noNotesText}>Sem anotações.</Text>
                    )}
                  </TouchableOpacity>
                );
              })
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const getStatusColor = (status) => {
  switch (status) {
    case 'Confirmada': return '#10B981';
    case 'Aguardando Confirmação': return '#F59E0B';
    case 'Cancelada': return '#EF4444';
    case 'Realizada': return '#64748B';
    default: return '#94A3B8';
  }
};

const styles = StyleSheet.create({
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8FAFC' },
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 24,
    backgroundColor: '#F8FAFC',
  },
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#0F172A', flex: 1, textAlign: 'center' },
  closeBtn: { padding: 4 },
  
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
    gap: 8,
  },
  activeTab: { borderBottomColor: '#0284C7' },
  tabText: { fontSize: 15, fontWeight: '600', color: '#94A3B8' },
  activeTabText: { color: '#0284C7', fontWeight: '700' },

  content: { flex: 1, paddingHorizontal: 16 },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    marginBottom: 24,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F0F9FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  avatarText: { fontSize: 32, fontWeight: '800', color: '#0284C7' },
  patientName: { fontSize: 22, fontWeight: '800', color: '#0F172A', marginBottom: 32 },

  infoGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  infoLabel: { fontSize: 13, color: '#94A3B8', fontWeight: '600', marginBottom: 2 },
  infoValue: { fontSize: 16, color: '#334155', fontWeight: '600' },
  actionBtnBtn: { marginLeft: 'auto', backgroundColor: '#DCFCE7', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },

  sectionTitle: { fontSize: 13, fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16, marginLeft: 8 },
  emptyText: { textAlign: 'center', color: '#94A3B8', marginTop: 40, fontSize: 15 },
  
  appointmentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOpacity: 0.02,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  apptHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  apptDate: { fontSize: 15, fontWeight: '700', color: '#334155' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusText: { fontSize: 12, fontWeight: '800' },
  notesPreview: { backgroundColor: '#F8FAFC', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#F1F5F9' },
  notesText: { fontSize: 14, color: '#64748B', lineHeight: 20 },
  noNotesText: { fontSize: 14, color: '#94A3B8', fontStyle: 'italic' }
});
