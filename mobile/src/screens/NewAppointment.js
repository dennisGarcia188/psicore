import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, ScrollView, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Calendar as CalendarIcon, Clock } from 'lucide-react-native';
import api from '../api';

export default function NewAppointment({ navigation }) {
  const [patients, setPatients] = useState([]);
  const [selectedPatientId, setSelectedPatientId] = useState(null);
  
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  
  const [loadingPatients, setLoadingPatients] = useState(true);
  const [saving, setSaving] = useState(false);

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
      // CORREÇÃO DO TIMEZONE: Garantir que enviaremos o horário LOCAL correto, ignorando o Z (UTC)
      const tzOffset = date.getTimezoneOffset() * 60000;
      const localISOTime = new Date(date.getTime() - tzOffset).toISOString().slice(0, -1);
      
      const payload = {
        patient_id: selectedPatientId,
        date_time: localISOTime,
        status: 'Aguardando Confirmação'
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
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      const newDate = new Date(date);
      newDate.setFullYear(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
      setDate(newDate);
    }
  };

  const onChangeTime = (event, selectedTime) => {
    setShowTimePicker(Platform.OS === 'ios');
    if (selectedTime) {
      const newDate = new Date(date);
      newDate.setHours(selectedTime.getHours(), selectedTime.getMinutes(), 0, 0);
      setDate(newDate);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeBtn}>
          <ChevronLeft color="#0F172A" size={28} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Novo Agendamento</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.sectionTitle}>Paciente</Text>
        
        {loadingPatients ? (
          <ActivityIndicator color="#0284C7" style={{ margin: 20 }} />
        ) : (
          <View style={styles.patientList}>
            {patients.map((p, index) => (
              <TouchableOpacity 
                key={p.id} 
                style={[
                  styles.patientItem, 
                  selectedPatientId === p.id && styles.patientItemActive,
                  index === patients.length - 1 && { borderBottomWidth: 0 }
                ]}
                onPress={() => setSelectedPatientId(p.id)}
              >
                <View style={[styles.radio, selectedPatientId === p.id && styles.radioActive]}>
                  {selectedPatientId === p.id && <View style={styles.radioInner} />}
                </View>
                <Text style={[styles.patientName, selectedPatientId === p.id && styles.patientNameActive]}>
                  {p.name}
                </Text>
              </TouchableOpacity>
            ))}
            {patients.length === 0 && (
              <Text style={{ color: '#64748B', padding: 16 }}>Nenhum paciente cadastrado.</Text>
            )}
          </View>
        )}

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

        {showDatePicker && (
          <DateTimePicker
            value={date}
            mode="date"
            display="default"
            onChange={onChangeDate}
          />
        )}
        
        {showTimePicker && (
          <DateTimePicker
            value={date}
            mode="time"
            display="default"
            onChange={onChangeTime}
          />
        )}
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
  patientList: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    overflow: 'hidden',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  patientItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  patientItemActive: { backgroundColor: '#F8FAFC' },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  radioActive: { borderColor: '#0284C7' },
  radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#0284C7' },
  patientName: { fontSize: 16, color: '#334155', fontWeight: '600' },
  patientNameActive: { color: '#0F172A', fontWeight: '700' },
  datePickerContainer: { gap: 12, marginBottom: 40 },
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
});
