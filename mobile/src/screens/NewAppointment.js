import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, ScrollView, Platform, Modal, TextInput } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Calendar as CalendarIcon, Clock, User, ChevronDown, Search, X, CheckCircle } from 'lucide-react-native';
import api from '../api';

const STATUS_COLOR = {
  'Confirmada': '#10B981',
  'Aguardando Confirmação': '#F59E0B',
  'Cancelada': '#EF4444',
  'Realizada': '#64748B',
};

const STATUS_OPTIONS = ['Confirmada', 'Aguardando Confirmação', 'Cancelada', 'Realizada'];

export default function NewAppointment({ navigation }) {
  const [patients, setPatients] = useState([]);
  const [selectedPatientId, setSelectedPatientId] = useState(null);
  
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [status, setStatus] = useState('Confirmada');
  const [fee, setFee] = useState('');
  const [isPaid, setIsPaid] = useState(false);
  
  const [loadingPatients, setLoadingPatients] = useState(true);
  const [saving, setSaving] = useState(false);

  // Modal de Pacientes
  const [showPatientModal, setShowPatientModal] = useState(false);
  const [searchPatient, setSearchPatient] = useState('');

  useEffect(() => {
    const loadPatients = async () => {
      try {
        const res = await api.get('/patients/');
        setPatients(res.data);
      } catch (err) {
        Alert.alert('Erro', 'Não foi possível carregar os pacientes.');
      } finally {
        setLoadingPatients(false);
      }
    };
    loadPatients();
  }, []);

  const handleSave = async () => {
    if (!selectedPatientId) {
      Alert.alert('Atenção', 'Selecione um paciente.');
      return;
    }

    setSaving(true);
    try {
      const tzOffset = date.getTimezoneOffset() * 60000;
      const localISOTime = new Date(date.getTime() - tzOffset).toISOString().slice(0, -1);
      
      const payload = {
        patient_id: selectedPatientId,
        date_time: localISOTime,
        status: status,
        fee: parseFloat(fee) || 0,
        is_paid: isPaid
      };

      await api.post('/appointments/', payload);
      Alert.alert('Sucesso', 'Agendamento criado!');
      navigation.goBack();
    } catch (err) {
      console.error(err);
      Alert.alert('Erro', 'Falha ao criar o agendamento.');
    } finally {
      setSaving(false);
    }
  };

  const onChangeDate = (event, selectedDate) => {
    if (Platform.OS === 'android') setShowDatePicker(false);
    if (selectedDate) {
      const newDate = new Date(date);
      newDate.setFullYear(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
      setDate(newDate);
    }
  };

  const onChangeTime = (event, selectedTime) => {
    if (Platform.OS === 'android') setShowTimePicker(false);
    if (selectedTime) {
      const newDate = new Date(date);
      newDate.setHours(selectedTime.getHours(), selectedTime.getMinutes(), 0, 0);
      setDate(newDate);
    }
  };

  const filteredPatients = patients.filter(p => p.name.toLowerCase().includes(searchPatient.toLowerCase()));
  const selectedPatientName = patients.find(p => p.id === selectedPatientId)?.name;

  return (
    <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeBtn}>
          <ChevronLeft color="#0F172A" size={28} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Novo Agendamento</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView style={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.sectionTitle}>Paciente</Text>
        
        <TouchableOpacity 
          style={styles.dropdownBtn}
          onPress={() => setShowPatientModal(true)}
          disabled={loadingPatients}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={[styles.iconBox, { backgroundColor: '#F0F9FF', width: 40, height: 40, marginRight: 12 }]}>
              <User size={18} color="#0284C7" />
            </View>
            <Text style={[styles.dropdownText, !selectedPatientId && { color: '#94A3B8' }]}>
              {loadingPatients ? 'Carregando...' : (selectedPatientName || 'Selecionar paciente...')}
            </Text>
          </View>
          <ChevronDown size={20} color="#94A3B8" />
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>Data e Hora</Text>
        <View style={styles.datePickerContainer}>
          <TouchableOpacity style={styles.dateBtn} onPress={() => setShowDatePicker(true)}>
            <View style={styles.iconBox}>
              <CalendarIcon size={20} color="#0284C7" />
            </View>
            <View>
              <Text style={styles.dateBtnLabel}>Data da Sessão</Text>
              <Text style={styles.dateBtnValue}>{date.toLocaleDateString('pt-BR')}</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.dateBtn} onPress={() => setShowTimePicker(true)}>
            <View style={[styles.iconBox, { backgroundColor: '#F0FDF4' }]}>
              <Clock size={20} color="#16A34A" />
            </View>
            <View>
              <Text style={styles.dateBtnLabel}>Horário</Text>
              <Text style={styles.dateBtnValue}>
                {date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Financeiro</Text>
        <View style={styles.financeContainer}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Valor da Sessão (R$)</Text>
            <TextInput
              style={styles.input}
              placeholder="0,00"
              keyboardType="numeric"
              value={fee}
              onChangeText={setFee}
            />
          </View>
          <TouchableOpacity 
            style={[styles.payBtn, isPaid && styles.payBtnActive]} 
            onPress={() => setIsPaid(!isPaid)}
          >
            <View style={[styles.payCircle, isPaid && styles.payCircleActive]}>
              {isPaid && <CheckCircle size={14} color="#FFF" />}
            </View>
            <Text style={[styles.payBtnText, isPaid && styles.payBtnTextActive]}>
              {isPaid ? 'Pagamento Realizado' : 'Marcar como Pago'}
            </Text>
          </TouchableOpacity>
        </View>

      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.saveBtn, (saving || !selectedPatientId) && styles.saveBtnDisabled]} 
          onPress={handleSave}
          disabled={saving || !selectedPatientId}
        >
          <Text style={styles.saveBtnText}>{saving ? 'Salvando...' : 'Confirmar Agendamento'}</Text>
        </TouchableOpacity>
      </View>

      {/* DatePicker para Android e iOS */}
      {Platform.OS === 'ios' ? (
        <Modal visible={showDatePicker || showTimePicker} transparent animationType="slide">
          <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <View style={{ backgroundColor: '#FFF', paddingBottom: 20 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'flex-end', padding: 16, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' }}>
                <TouchableOpacity onPress={() => { setShowDatePicker(false); setShowTimePicker(false); }}>
                  <Text style={{ color: '#0284C7', fontWeight: '800', fontSize: 16 }}>Concluído</Text>
                </TouchableOpacity>
              </View>
              {showDatePicker && (
                <DateTimePicker value={date} mode="date" display="inline" themeVariant="light" onChange={onChangeDate} />
              )}
              {showTimePicker && (
                <DateTimePicker value={date} mode="time" display="spinner" themeVariant="light" onChange={onChangeTime} />
              )}
            </View>
          </View>
        </Modal>
      ) : (
        <>
          {showDatePicker && (
            <DateTimePicker value={date} mode="date" display="default" onChange={onChangeDate} />
          )}
          {showTimePicker && (
            <DateTimePicker value={date} mode="time" display="default" onChange={onChangeTime} />
          )}
        </>
      )}

      {/* Modal de Seleção de Paciente */}
      <Modal visible={showPatientModal} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setShowPatientModal(false)}>
        <SafeAreaView style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Selecionar Paciente</Text>
            <TouchableOpacity onPress={() => setShowPatientModal(false)} style={styles.closeBtn}>
              <X color="#0F172A" size={24} />
            </TouchableOpacity>
          </View>
          <View style={styles.searchContainer}>
            <Search color="#94A3B8" size={20} />
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar paciente..."
              placeholderTextColor="#94A3B8"
              value={searchPatient}
              onChangeText={setSearchPatient}
              autoFocus={Platform.OS === 'ios'}
            />
          </View>
          <ScrollView style={{ flex: 1 }}>
            {filteredPatients.map(p => (
              <TouchableOpacity 
                key={p.id}
                style={[styles.patientItem, selectedPatientId === p.id && styles.patientItemActive]}
                onPress={() => {
                  setSelectedPatientId(p.id);
                  setShowPatientModal(false);
                }}
              >
                <View style={[styles.radio, selectedPatientId === p.id && styles.radioActive]}>
                  {selectedPatientId === p.id && <View style={styles.radioInner} />}
                </View>
                <Text style={[styles.patientName, selectedPatientId === p.id && styles.patientNameActive]}>{p.name}</Text>
              </TouchableOpacity>
            ))}
            {filteredPatients.length === 0 && (
              <Text style={{ textAlign: 'center', marginTop: 40, color: '#94A3B8' }}>Nenhum paciente encontrado.</Text>
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 24,
    backgroundColor: '#F8FAFC',
  },
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#0F172A' },
  closeBtn: { padding: 4 },
  content: { flex: 1, padding: 16 },
  sectionTitle: { fontSize: 13, fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12, marginTop: 8, marginLeft: 8 },
  
  dropdownBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  dropdownText: { fontSize: 16, color: '#0F172A', fontWeight: '600' },

  datePickerContainer: { gap: 12, marginBottom: 32 },
  dateBtn: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#F0F9FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  dateBtnLabel: { fontSize: 13, color: '#64748B', fontWeight: '600', marginBottom: 2 },
  dateBtnValue: { fontSize: 18, fontWeight: '800', color: '#0F172A' },

  statusGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 40 },
  statusOptionBtn: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#F1F5F9',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  statusOptionText: { fontSize: 14, fontWeight: '600', color: '#64748B', textAlign: 'center' },

  footer: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  saveBtn: {
    backgroundColor: '#0284C7',
    padding: 18,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#0284C7',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  saveBtnDisabled: { opacity: 0.5, shadowOpacity: 0 },
  saveBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800', letterSpacing: 0.5 },

  // Modal Styles
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  modalTitle: { fontSize: 18, fontWeight: '800', color: '#0F172A' },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F1F5F9', margin: 16, paddingHorizontal: 16, borderRadius: 16, height: 50 },
  searchInput: { flex: 1, marginLeft: 12, fontSize: 16, color: '#0F172A' },
  patientItem: { flexDirection: 'row', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#F1F5F9', backgroundColor: '#FFFFFF' },
  patientItemActive: { backgroundColor: '#F8FAFC' },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: '#CBD5E1', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  radioActive: { borderColor: '#0284C7' },
  radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#0284C7' },
  patientName: { fontSize: 16, color: '#334155', fontWeight: '600' },
  patientNameActive: { color: '#0F172A', fontWeight: '700' },
  
  // Finance Styles
  financeContainer: { 
    backgroundColor: '#FFFFFF', 
    padding: 20, 
    borderRadius: 24, 
    borderWidth: 1, 
    borderColor: '#F1F5F9',
    marginBottom: 40,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  inputGroup: { marginBottom: 16 },
  inputLabel: { fontSize: 13, fontWeight: '700', color: '#64748B', marginBottom: 8, textTransform: 'uppercase' },
  input: { 
    backgroundColor: '#F8FAFC', 
    borderWidth: 1, 
    borderColor: '#E2E8F0', 
    borderRadius: 12, 
    padding: 12, 
    fontSize: 16, 
    color: '#0F172A',
    fontWeight: '700'
  },
  payBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 12,
  },
  payBtnActive: {
    backgroundColor: '#DCFCE7',
    borderColor: '#16A34A',
  },
  payCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  payCircleActive: {
    backgroundColor: '#16A34A',
    borderColor: '#16A34A',
  },
  payBtnText: { fontSize: 15, fontWeight: '600', color: '#64748B' },
  payBtnTextActive: { color: '#16A34A', fontWeight: '800' },
});
