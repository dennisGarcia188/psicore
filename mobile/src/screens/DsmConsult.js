import React, { useState } from 'react';
import { View, Text, TextInput, FlatList, StyleSheet, SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native';
import { Search, BookOpen } from 'lucide-react-native';
import ScreenHeader from '../components/ScreenHeader';

const DSM_DATA = [
  { code: 'F32.x', title: 'Transtorno Depressivo Maior', description: 'Caracterizado por humor deprimido na maior parte do dia, diminuição do interesse ou prazer, perda ou ganho de peso, insônia ou hipersonia, entre outros sintomas, durando pelo menos duas semanas.' },
  { code: 'F41.1', title: 'Transtorno de Ansiedade Generalizada (TAG)', description: 'Ansiedade e preocupação excessivas (expectativa apreensiva), ocorrendo na maioria dos dias por pelo menos seis meses, sobre diversos eventos ou atividades.' },
  { code: 'F41.0', title: 'Transtorno do Pânico', description: 'Ataques de pânico recorrentes e inesperados. Um ataque de pânico é um surto abrupto de medo ou desconforto intenso que alcança um pico em minutos.' },
  { code: 'F42', title: 'Transtorno Obsessivo-Compulsivo (TOC)', description: 'Presença de obsessões, compulsões ou ambas, que consomem tempo e causam sofrimento clinicamente significativo ou prejuízo no funcionamento.' },
  { code: 'F90.x', title: 'Transtorno de Déficit de Atenção/Hiperatividade (TDAH)', description: 'Padrão persistente de desatenção e/ou hiperatividade-impulsividade que interfere no funcionamento ou no desenvolvimento.' },
  { code: 'F43.10', title: 'Transtorno de Estresse Pós-Traumático (TEPT)', description: 'Desenvolvimento de sintomas específicos após a exposição a um ou mais eventos traumáticos, incluindo lembranças intrusivas, esquiva e alterações cognitivas.' },
  { code: 'F31.x', title: 'Transtorno Bipolar', description: 'Episódios de alterações de humor que variam de mania ou hipomania a depressão. Requer histórico de pelo menos um episódio maníaco (Tipo I) ou hipomaníaco (Tipo II).' },
  { code: 'F50.0', title: 'Anorexia Nervosa', description: 'Restrição da ingestão calórica levando a um peso corporal significativamente baixo, medo intenso de ganhar peso e perturbação na percepção da imagem corporal.' },
  { code: 'F60.3', title: 'Transtorno da Personalidade Borderline', description: 'Padrão de instabilidade nas relações interpessoais, autoimagem e afetos, acompanhado de impulsividade acentuada, começando no início da idade adulta.' },
  { code: 'F84.0', title: 'Transtorno do Espectro Autista (TEA)', description: 'Déficits persistentes na comunicação e na interação social em múltiplos contextos, acompanhados de padrões restritos e repetitivos de comportamento.' },
];

export default function DsmConsult() {
  const [searchTerm, setSearchTerm] = useState('');

  const normalize = (str) =>
    str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

  const filteredDsm = DSM_DATA.filter(item => {
    const term = normalize(searchTerm);
    return (
      normalize(item.title).includes(term) ||
      normalize(item.code).includes(term) ||
      normalize(item.description).includes(term)
    );
  });

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{item.title}</Text>
        </View>
        <View style={styles.badge}>
          <BookOpen size={14} color="#0284C7" style={{ marginRight: 6 }} />
          <Text style={styles.badgeText}>{item.code}</Text>
        </View>
      </View>
      <Text style={styles.description}>{item.description}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <ScreenHeader title="DSM-5" />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>

        <View style={styles.searchContainer}>
          <Search color="#94A3B8" size={20} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar por código ou transtorno..."
            placeholderTextColor="#94A3B8"
            value={searchTerm}
            onChangeText={setSearchTerm}
            autoCorrect={false}
          />
        </View>

        <FlatList
          data={filteredDsm}
          keyExtractor={item => item.code}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <Text style={styles.emptyText}>Nenhum transtorno encontrado.</Text>
          }
        />
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 20,
    marginTop: 10,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    height: 56,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  searchInput: { flex: 1, marginLeft: 12, fontSize: 16, color: '#0F172A', fontWeight: '500' },
  list: { paddingHorizontal: 16, paddingBottom: 24 },
  card: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  titleContainer: { flex: 1, marginRight: 16 },
  title: { fontSize: 17, fontWeight: '800', color: '#0F172A', lineHeight: 22 },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F9FF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  badgeText: { fontSize: 13, fontWeight: '800', color: '#0284C7' },
  description: { fontSize: 15, color: '#475569', lineHeight: 24, fontWeight: '400' },
  emptyText: { textAlign: 'center', color: '#94A3B8', marginTop: 60, fontSize: 16, fontWeight: '500' }
});
