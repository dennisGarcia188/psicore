import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { DollarSign, Plus, ArrowUpCircle, ArrowDownCircle, Wallet } from 'lucide-react-native';
import api from '../api';
import ScreenHeader from '../components/ScreenHeader';

export default function Finance({ navigation }) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ income: 0, expense: 0, balance: 0 });

  const fetchFinance = async () => {
    try {
      setLoading(true);
      const res = await api.get('/appointments/');
      const data = res.data;
      
      // Ordenar por data decrescente
      const sorted = data.sort((a, b) => new Date(b.date_time) - new Date(a.date_time));
      setTransactions(sorted);
      
      let income = 0;
      let pending = 0;
      
      sorted.forEach(t => {
        const value = t.fee || 0;
        if (t.is_paid) {
          income += value;
        } else {
          pending += value;
        }
      });
      
      setStats({ income, expense: pending, balance: income });
    } catch (err) {
      console.error(err);
      Alert.alert('Erro', 'Não foi possível carregar os dados financeiros.');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchFinance();
    }, [])
  );

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={[styles.iconBox, { backgroundColor: item.is_paid ? '#DCFCE7' : '#FEF2F2' }]}>
        {item.is_paid ? 
          <ArrowUpCircle size={20} color="#16A34A" /> : 
          <ArrowDownCircle size={20} color="#EF4444" />
        }
      </View>
      <View style={styles.cardInfo}>
        <Text style={styles.description}>{item.patient_name || 'Consulta'}</Text>
        <Text style={styles.date}>{new Date(item.date_time).toLocaleDateString('pt-BR')}</Text>
      </View>
      <Text style={[styles.amount, { color: item.is_paid ? '#16A34A' : '#EF4444' }]}>
        R$ {(item.fee || 0).toFixed(2)}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <ScreenHeader title="Financeiro" />
      
      <View style={styles.summaryContainer}>
        <View style={styles.balanceCard}>
          <View style={styles.balanceHeader}>
            <Wallet size={20} color="#FFFFFF" />
            <Text style={styles.balanceLabel}>Faturamento Total</Text>
          </View>
          <Text style={styles.balanceValue}>R$ {(stats.income + stats.expense).toFixed(2)}</Text>
        </View>

        <View style={styles.statsRow}>
          <View style={[styles.statBox, styles.incomeBox]}>
            <ArrowUpCircle size={16} color="#16A34A" />
            <View>
              <Text style={styles.statLabel}>Recebido</Text>
              <Text style={styles.statValue}>R$ {stats.income.toFixed(2)}</Text>
            </View>
          </View>
          <View style={[styles.statBox, styles.expenseBox]}>
            <ArrowDownCircle size={16} color="#EF4444" />
            <View>
              <Text style={styles.statLabel}>Pendente</Text>
              <Text style={styles.statValue}>R$ {stats.expense.toFixed(2)}</Text>
            </View>
          </View>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Histórico de Sessões</Text>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#0284C7" />
        </View>
      ) : (
        <FlatList
          data={transactions}
          keyExtractor={item => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <Text style={styles.emptyText}>Nenhuma transação encontrada.</Text>
          }
        />
      )}

      <TouchableOpacity 
        style={styles.fab}
        onPress={() => Alert.alert('Novo', 'Funcionalidade de cadastro em breve no mobile.')}
      >
        <Plus size={24} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  summaryContainer: { padding: 16 },
  balanceCard: {
    backgroundColor: '#0284C7',
    borderRadius: 24,
    padding: 24,
    marginBottom: 16,
    shadowColor: '#0284C7',
    shadowOpacity: 0.3,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  balanceHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  balanceLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 14, fontWeight: '600' },
  balanceValue: { color: '#FFFFFF', fontSize: 32, fontWeight: '800' },
  statsRow: { flexDirection: 'row', gap: 12 },
  statBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  incomeBox: { borderLeftWidth: 4, borderLeftColor: '#16A34A' },
  expenseBox: { borderLeftWidth: 4, borderLeftColor: '#EF4444' },
  statLabel: { fontSize: 12, color: '#64748B', fontWeight: '600', marginBottom: 2 },
  statValue: { fontSize: 15, fontWeight: '800', color: '#0F172A' },
  sectionTitle: { fontSize: 14, fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 1, marginHorizontal: 20, marginBottom: 12, marginTop: 8 },
  list: { paddingHorizontal: 16, paddingBottom: 100 },
  card: {
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
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  cardInfo: { flex: 1 },
  description: { fontSize: 16, fontWeight: '700', color: '#334155', marginBottom: 4 },
  date: { fontSize: 13, color: '#94A3B8', fontWeight: '500' },
  amount: { fontSize: 16, fontWeight: '800' },
  emptyText: { textAlign: 'center', color: '#94A3B8', marginTop: 40, fontSize: 16 },
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
    elevation: 8,
    shadowColor: '#0284C7',
    shadowOpacity: 0.4,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
  }
});
