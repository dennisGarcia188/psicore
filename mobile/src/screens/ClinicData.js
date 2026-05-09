import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft } from 'lucide-react-native';
import { TextInputMask } from 'react-native-masked-text';
import api from '../api';

export default function ClinicData({ navigation }) {
  const [formData, setFormData] = useState({
    clinic_name: '',
    cnpj: '',
    address: '',
    phone: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchClinicData = async () => {
      try {
        const res = await api.get('/settings/');
        if (res.data) {
          setFormData({
            clinic_name: res.data.clinic_name || '',
            cnpj: res.data.cnpj || '',
            address: res.data.address || '',
            phone: res.data.phone || '',
          });
        }
      } catch (err) {
        console.error(err);
        Alert.alert('Erro', 'Falha ao carregar os dados do consultório.');
      } finally {
        setLoading(false);
      }
    };
    fetchClinicData();
  }, []);

  const handleSave = async () => {
    if (!formData.clinic_name) {
      Alert.alert('Erro', 'O nome do consultório é obrigatório.');
      return;
    }

    setSaving(true);
    try {
      await api.put('/settings/', formData);
      Alert.alert('Sucesso', 'Dados atualizados com sucesso!');
      navigation.goBack();
    } catch (err) {
      console.error(err);
      Alert.alert('Erro', 'Falha ao salvar os dados.');
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
        <Text style={styles.headerTitle}>Dados do Consultório</Text>
        <View style={{ width: 28 }} />
      </View>

      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#0284C7" />
        </View>
      ) : (
        <>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
            <ScrollView style={styles.content} keyboardShouldPersistTaps="handled">
              <View style={styles.formCard}>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Nome do Consultório *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Ex: Clínica PsiCore"
                    placeholderTextColor="#94A3B8"
                    value={formData.clinic_name}
                    onChangeText={(v) => handleChange('clinic_name', v)}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>CNPJ (Opcional)</Text>
                  <TextInputMask
                    type={'cnpj'}
                    style={styles.input}
                    placeholder="00.000.000/0000-00"
                    placeholderTextColor="#94A3B8"
                    keyboardType="number-pad"
                    value={formData.cnpj}
                    onChangeText={(v) => handleChange('cnpj', v)}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Endereço</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Rua, Número, Bairro, Cidade - UF"
                    placeholderTextColor="#94A3B8"
                    value={formData.address}
                    onChangeText={(v) => handleChange('address', v)}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Telefone da Clínica</Text>
                  <TextInputMask
                    type={'cel-phone'}
                    options={{
                      maskType: 'BRL',
                      withDDD: true,
                      dddMask: '(99) '
                    }}
                    style={styles.input}
                    placeholder="(11) 99999-9999"
                    placeholderTextColor="#94A3B8"
                    keyboardType="phone-pad"
                    value={formData.phone}
                    onChangeText={(v) => handleChange('phone', v)}
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
              <Text style={styles.saveBtnText}>{saving ? 'Salvando...' : 'Salvar Alterações'}</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
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
