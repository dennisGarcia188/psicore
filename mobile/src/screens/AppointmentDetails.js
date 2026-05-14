import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Trash2, Save, Calendar as CalendarIcon, Clock, Edit3, CheckCircle, DollarSign } from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import api from '../api';

const STATUS_COLOR = {
  'Confirmada': '#10B981',
  'Aguardando Confirmação': '#F59E0B',
  'Cancelada': '#EF4444',
  'Realizada': '#64748B',
};

const STATUS_OPTIONS = ['Confirmada', 'Aguardando Confirmação', 'Cancelada', 'Realizada'];

export default function AppointmentDetails({ route, navigation }) {
  const { appointment } = route.params;

  const [date, setDate] = useState(new Date(appointment.date_time));
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [status, setStatus] = useState(appointment.status);
  const [notes, setNotes] = useState(appointment.notes || '');
  const [fee, setFee] = useState(appointment.fee?.toString() || '');
  const [isPaid, setIsPaid] = useState(appointment.is_paid || false);
  
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [activeTab, setActiveTab] = useState('dados'); // 'dados' ou 'notas'

  const handleSave = async () => {
    setSaving(true);
    try {
      const tzOffset = date.getTimezoneOffset() * 60000;
      const localISOTime = new Date(date.getTime() - tzOffset).toISOString().slice(0, -1);

      const payload = {
        date_time: localISOTime,
        status: status,
        notes: notes,
        patient_id: appointment.patient_id,
        fee: parseFloat(fee) || 0,
        is_paid: isPaid
      };

      await api.put(`/appointments/${appointment.id}`, payload);
      Alert.alert('Sucesso', 'Agendamento atualizado!');
      navigation.goBack();
    } catch (err) {
      console.error(err);
      Alert.alert('Erro', 'Falha ao atualizar agendamento.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      "Excluir Agendamento",
      "Tem certeza que deseja excluir esta consulta?",
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Excluir", 
          style: "destructive",
          onPress: async () => {
            setDeleting(true);
            try {
              await api.delete(`/appointments/${appointment.id}`);
              navigation.goBack();
            } catch (err) {
              console.error(err);
              Alert.alert('Erro', 'Falha ao excluir.');
            } finally {
              setDeleting(false);
            }
          }
        }
      ]
    );
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

  return (
    <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeBtn}>
          <ChevronLeft color="#0F172A" size={28} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detalhes da Sessão</Text>
        <TouchableOpacity onPress={handleDelete} disabled={deleting} style={styles.deleteBtn}>
          {deleting ? <ActivityIndicator size="small" color="#EF4444" /> : <Trash2 color="#EF4444" size={24} />}
        </TouchableOpacity>
      </View>

      <View style={styles.patientBanner}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{appointment.patient_name.charAt(0).toUpperCase()}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.patientName}>{appointment.patient_name}</Text>
          <View style={[styles.statusBadge, { backgroundColor: STATUS_COLOR[status] + '20' }]}>
            <Text style={[styles.statusText, { color: STATUS_COLOR[status] }]}>{status}</Text>
          </View>
        </View>
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity 
          style={[styles.tabBtn, activeTab === 'dados' && styles.tabBtnActive]}
          onPress={() => setActiveTab('dados')}
        >
          <CalendarIcon size={18} color={activeTab === 'dados' ? '#0284C7' : '#94A3B8'} style={{ marginRight: 6 }}/>
          <Text style={[styles.tabText, activeTab === 'dados' && styles.tabTextActive]}>Dados</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tabBtn, activeTab === 'notas' && styles.tabBtnActive]}
          onPress={() => setActiveTab('notas')}
        >
          <Edit3 size={18} color={activeTab === 'notas' ? '#0284C7' : '#94A3B8'} style={{ marginRight: 6 }}/>
          <Text style={[styles.tabText, activeTab === 'notas' && styles.tabTextActive]}>Anotações</Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView style={styles.content} keyboardShouldPersistTaps="handled">
          
          {activeTab === 'dados' && (
            <>
              <Text style={styles.sectionTitle}>Data e Hora</Text>
              <View style={styles.datePickerContainer}>
                <TouchableOpacity style={styles.dateBtn} onPress={() => setShowDatePicker(true)}>
                  <View style={styles.iconBox}>
                    <CalendarIcon size={20} color="#0284C7" />
                  </View>
                  <View>
                    <Text style={styles.dateBtnLabel}>Data</Text>
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

              <Text style={styles.sectionTitle}>Status</Text>
              <View style={styles.statusGrid}>
                {STATUS_OPTIONS.map(opt => (
                  <TouchableOpacity 
                    key={opt}
                    style={[
                      styles.statusOptionBtn, 
                      status === opt && { borderColor: STATUS_COLOR[opt], backgroundColor: STATUS_COLOR[opt] + '10' }
                    ]}
                    onPress={() => setStatus(opt)}
                  >
                    <Text style={[
                      styles.statusOptionText, 
                      status === opt && { color: STATUS_COLOR[opt], fontWeight: '800' }
                    ]}>
                      {opt}
                    </Text>
                  </TouchableOpacity>
                ))}
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
              </View>
            </>
          )}

          {activeTab === 'notas' && (
            <>
              <Text style={styles.sectionTitle}>Anotações do Prontuário</Text>
              <TextInput
                style={styles.textArea}
                multiline
                placeholder="Descreva as observações clínicas desta sessão..."
                placeholderTextColor="#94A3B8"
                value={notes}
                onChangeText={setNotes}
                textAlignVertical="top"
              />
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

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

      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.saveBtn, saving && styles.saveBtnDisabled]} 
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <>
              <Save size={20} color="#FFF" style={{ marginRight: 8 }} />
              <Text style={styles.saveBtnText}>Salvar Alterações</Text>
            </>
          )}
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
  deleteBtn: { padding: 4 },
  patientBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    margin: 16,
    marginTop: 0,
    padding: 20,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#0284C7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  avatarText: { color: '#FFF', fontSize: 24, fontWeight: '800' },
  patientName: { fontSize: 18, fontWeight: '800', color: '#0F172A', marginBottom: 8 },
  statusBadge: { alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  statusText: { fontSize: 13, fontWeight: '800' },
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    marginBottom: 8,
  },
  tabBtn: { flex: 1, flexDirection: 'row', padding: 16, justifyContent: 'center', alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabBtnActive: { borderBottomColor: '#0284C7' },
  tabText: { fontSize: 15, fontWeight: '600', color: '#94A3B8' },
  tabTextActive: { color: '#0284C7', fontWeight: '800' },
  content: { flex: 1, padding: 16 },
  sectionTitle: { fontSize: 13, fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12, marginTop: 8, marginLeft: 8 },
  datePickerContainer: { gap: 12, marginBottom: 24 },
  dateBtn: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    alignItems: 'center',
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
  textArea: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    borderRadius: 20,
    padding: 20,
    minHeight: 200,
    fontSize: 16,
    color: '#0F172A',
    lineHeight: 24,
    marginBottom: 40,
    shadowColor: '#000',
    shadowOpacity: 0.02,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 1,
  },
  footer: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  saveBtn: {
    flexDirection: 'row',
    backgroundColor: '#0284C7',
    padding: 18,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0284C7',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  saveBtnDisabled: { opacity: 0.5, shadowOpacity: 0 },
  saveBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800', letterSpacing: 0.5 },
  
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
