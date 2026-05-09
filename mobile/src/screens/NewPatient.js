import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft } from 'lucide-react-native';
import api from '../api';

export default function NewPatient({ navigation }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    cpf: '',
    birth_date: ''
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!formData.name) {
      Alert.alert('Erro', 'O campo Nome é obrigatório.');
      return;
    }

    setSaving(true);
    try {
      await api.post('/patients/', formData);
      Alert.alert('Sucesso', 'Paciente cadastrado com sucesso!');
      navigation.goBack();
    } catch (err) {
      console.error(err);
      Alert.alert('Erro', 'Falha ao cadastrar paciente. Verifique os dados.');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeBtn}>
          <ChevronLeft color="#0F172A" size={28} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Novo Paciente</Text>
        <View style={{ width: 28 }} />
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView style={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.formCard}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nome Completo *</Text>
              <TextInput
                style={styles.input}
                placeholder="Ex: João da Silva"
                placeholderTextColor="#94A3B8"
                value={formData.name}
                onChangeText={(v) => handleChange('name', v)}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>E-mail</Text>
              <TextInput
                style={styles.input}
                placeholder="Ex: joao@email.com"
                placeholderTextColor="#94A3B8"
                keyboardType="email-address"
                autoCapitalize="none"
                value={formData.email}
                onChangeText={(v) => handleChange('email', v)}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Telefone (WhatsApp)</Text>
              <TextInput
                style={styles.input}
                placeholder="(11) 99999-9999"
                placeholderTextColor="#94A3B8"
                keyboardType="phone-pad"
                value={formData.phone}
                onChangeText={(v) => handleChange('phone', v)}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>CPF</Text>
              <TextInput
                style={styles.input}
                placeholder="000.000.000-00"
                placeholderTextColor="#94A3B8"
                keyboardType="number-pad"
                value={formData.cpf}
                onChangeText={(v) => handleChange('cpf', v)}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Data de Nascimento</Text>
              <TextInput
                style={styles.input}
                placeholder="AAAA-MM-DD"
                placeholderTextColor="#94A3B8"
                value={formData.birth_date}
                onChangeText={(v) => handleChange('birth_date', v)}
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.saveBtn, saving && styles.saveBtnDisabled]} 
          onPress={handleSave}
          disabled={saving}
        >
          <Text style={styles.saveBtnText}>{saving ? 'Salvando...' : 'Cadastrar Paciente'}</Text>
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
  formCard: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    marginBottom: 40,
  },
  inputGroup: { marginBottom: 20 },
  label: {
    fontSize: 13,
    fontWeight: '800',
    color: '#94A3B8',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
    color: '#0F172A',
    fontWeight: '500'
  },
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
