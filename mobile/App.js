import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Calendar, Users, Book, Menu as MenuIcon } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import Login from './src/screens/Login';
import Dashboard from './src/screens/Dashboard';
import PatientsList from './src/screens/PatientsList';
import DsmConsult from './src/screens/DsmConsult';
import Menu from './src/screens/Menu';
import NewPatient from './src/screens/NewPatient';
import NewAppointment from './src/screens/NewAppointment';
import ClinicData from './src/screens/ClinicData';
import AppointmentDetails from './src/screens/AppointmentDetails';
import PatientDetails from './src/screens/PatientDetails';
import Finance from './src/screens/Finance';
import Reports from './src/screens/Reports';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#0284C7',
        tabBarInactiveTintColor: '#64748B',
        headerStyle: { backgroundColor: '#FFFFFF' },
        headerTitleStyle: { fontWeight: '700', color: '#0F172A' },
        headerTitleAlign: 'center',
      }}
    >
      <Tab.Screen 
        name="Agenda" 
        component={Dashboard} 
        options={{
          tabBarIcon: ({ color, size }) => <Calendar color={color} size={size} />,
          title: 'Minha Agenda'
        }}
      />
      <Tab.Screen 
        name="Pacientes" 
        component={PatientsList} 
        options={{
          tabBarIcon: ({ color, size }) => <Users color={color} size={size} />,
        }}
      />
      <Tab.Screen 
        name="DSM-5" 
        component={DsmConsult} 
        options={{
          tabBarIcon: ({ color, size }) => <Book color={color} size={size} />,
        }}
      />
      <Tab.Screen 
        name="Menu" 
        component={Menu} 
        options={{
          tabBarIcon: ({ color, size }) => <MenuIcon color={color} size={size} />,
        }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  const [initialRoute, setInitialRoute] = useState(null);

  useEffect(() => {
    checkToken();
  }, []);

  const checkToken = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        setInitialRoute('MainApp');
      } else {
        setInitialRoute('Login');
      }
    } catch (e) {
      setInitialRoute('Login');
    }
  };

  if (initialRoute === null) return null; // loading

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={initialRoute}>
        <Stack.Screen 
          name="Login" 
          component={Login} 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="MainApp" 
          component={MainTabs} 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="NewPatient" 
          component={NewPatient} 
          options={{ presentation: 'modal', headerShown: false }} 
        />
        <Stack.Screen 
          name="NewAppointment" 
          component={NewAppointment} 
          options={{ presentation: 'modal', headerShown: false }} 
        />
        <Stack.Screen 
          name="ClinicData" 
          component={ClinicData} 
          options={{ presentation: 'modal', headerShown: false }} 
        />
        <Stack.Screen 
          name="AppointmentDetails" 
          component={AppointmentDetails} 
          options={{ presentation: 'modal', headerShown: false }} 
        />
        <Stack.Screen 
          name="PatientDetails" 
          component={PatientDetails} 
          options={{ presentation: 'modal', headerShown: false }} 
        />
        <Stack.Screen 
          name="Finance" 
          component={Finance} 
          options={{ presentation: 'modal', headerShown: false }} 
        />
        <Stack.Screen 
          name="Reports" 
          component={Reports} 
          options={{ presentation: 'modal', headerShown: false }} 
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
