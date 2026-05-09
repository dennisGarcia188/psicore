import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Plus } from 'lucide-react-native';
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import api from '../api';
import ScreenHeader from '../components/ScreenHeader';

const STATUS_COLOR = {
  'Confirmada': '#10B981',
  'Aguardando Confirmação': '#F59E0B',
  'Cancelada': '#EF4444',
  'Realizada': '#64748B',
};

export default function Dashboard({ navigation }) {
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('hoje'); // 'hoje', 'semana', 'mes'

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const pRes = await api.get('/patients/');
      const pts = pRes.data;
      
      let allAppts = [];
      for (let p of pts) {
        const aRes = await api.get(`/appointments/patient/${p.id}`);
        allAppts = [...allAppts, ...aRes.data.map(a => ({ ...a, patient_name: p.name }))];
      }
      
      const sorted = allAppts.sort((a, b) => new Date(a.date_time) - new Date(b.date_time));
      setAppointments(sorted);
      applyFilter(sorted, filter);
    } catch (err) {
      console.error(err);
      Alert.alert('Erro', 'Não foi possível carregar a agenda.');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchDashboard();
    }, [])
  );

  const applyFilter = (appts, currentFilter) => {
    const now = new Date();
    let start, end;

    if (currentFilter === 'hoje') {
      start = startOfDay(now);
      end = endOfDay(now);
    } else if (currentFilter === 'semana') {
      start = startOfWeek(now, { weekStartsOn: 0 }); // Domingo
      end = endOfWeek(now, { weekStartsOn: 0 });
    } else if (currentFilter === 'mes') {
      start = startOfMonth(now);
      end = endOfMonth(now);
    }

    const filtered = appts.filter(a => {
      // Se a data vier do backend com 'Z', removemos para não sofrer fuso
      const dateString = a.date_time.endsWith('Z') ? a.date_time.slice(0, -1) : a.date_time;
      const apptDate = new Date(dateString);
      return isWithinInterval(apptDate, { start, end });
    });

    setFilteredAppointments(filtered);
  };

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    applyFilter(appointments, newFilter);
  };

  const renderItem = ({ item }) => {
    const dateString = item.date_time.endsWith('Z') ? item.date_time.slice(0, -1) : item.date_time;
    const dateObj = new Date(dateString);
    const time = dateObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    const dateDay = filter !== 'hoje' ? dateObj.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }) + ' - ' : '';
    const color = STATUS_COLOR[item.status] || '#64748B';

    return (
      <TouchableOpacity 
        style={styles.card}
        onPress={() => navigation.navigate('AppointmentDetails', { appointment: item })}
        activeOpacity={0.7}
      >
        <View style={[styles.statusDot, { backgroundColor: color }]} />
        <View style={styles.cardContent}>
          <Text style={styles.time}>{dateDay}{time}</Text>
          <Text style={styles.patientName}>{item.patient_name}</Text>
          <Text style={[styles.statusText, { color }]}>{item.status}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <ScreenHeader title="Agenda" />
      
      <View style={styles.filterSection}>
        <View style={styles.filterContainer}>
          <TouchableOpacity 
            style={[styles.filterBtn, filter === 'hoje' && styles.filterBtnActive]} 
            onPress={() => handleFilterChange('hoje')}
          >
            <Text style={[styles.filterText, filter === 'hoje' && styles.filterTextActive]}>Hoje</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.filterBtn, filter === 'semana' && styles.filterBtnActive]} 
            onPress={() => handleFilterChange('semana')}
          >
            <Text style={[styles.filterText, filter === 'semana' && styles.filterTextActive]}>Semana</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.filterBtn, filter === 'mes' && styles.filterBtnActive]} 
            onPress={() => handleFilterChange('mes')}
          >
            <Text style={[styles.filterText, filter === 'mes' && styles.filterTextActive]}>Mês</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#0284C7" />
        </View>
      ) : (
        <FlatList
          data={filteredAppointments}
          keyExtractor={item => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <Text style={styles.emptyText}>Nenhuma consulta para este período.</Text>
          }
        />
      )}

      <TouchableOpacity 
        style={styles.fab} 
        onPress={() => navigation.navigate('NewAppointment')}
        activeOpacity={0.8}
      >
        <Plus size={24} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  filterSection: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  filterContainer: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 4,
  },
  filterBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  filterBtnActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  filterText: { fontSize: 14, fontWeight: '600', color: '#64748B' },
  filterTextActive: { color: '#0F172A', fontWeight: '800' },
  list: { padding: 16, paddingBottom: 100 },
  card: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  statusDot: { width: 14, height: 14, borderRadius: 7, marginRight: 16 },
  cardContent: { flex: 1 },
  time: { fontSize: 14, fontWeight: '700', color: '#94A3B8', textTransform: 'uppercase', marginBottom: 4 },
  patientName: { fontSize: 18, fontWeight: '800', color: '#0F172A', marginBottom: 6 },
  statusText: { fontSize: 13, fontWeight: '800' },
  emptyText: { textAlign: 'center', color: '#94A3B8', marginTop: 60, fontSize: 16, fontWeight: '500' },
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
    shadowColor: '#0284C7',
    shadowOpacity: 0.4,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  }
});
