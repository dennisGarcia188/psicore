import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Dimensions, Animated, SafeAreaView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Calendar, DollarSign, Users, ChevronRight } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

const slides = [
  {
    id: '1',
    title: 'Gestão Inteligente',
    description: 'Organize sua agenda e atendimentos em um único lugar, de forma simples e intuitiva.',
    icon: <Calendar size={80} color="#0284C7" />,
    colors: ['#F0F9FF', '#E0F2FE'],
  },
  {
    id: '2',
    title: 'Controle Financeiro',
    description: 'Acompanhe seu faturamento, sessões pagas e pendentes sem complicação.',
    icon: <DollarSign size={80} color="#16A34A" />,
    colors: ['#F0FDF4', '#DCFCE7'],
  },
  {
    id: '3',
    title: 'Foco no Paciente',
    description: 'Prontuários e históricos sempre acessíveis para você oferecer o melhor cuidado.',
    icon: <Users size={80} color="#7C3AED" />,
    colors: ['#F5F3FF', '#EDE9FE'],
  },
];

export default function Onboarding({ navigation }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const slidesRef = useRef(null);

  const viewableItemsChanged = useRef(({ viewableItems }) => {
    setCurrentIndex(viewableItems[0].index);
  }).current;

  const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const handleFinish = async () => {
    try {
      await AsyncStorage.setItem('@viewedOnboarding', 'true');
      navigation.replace('Login');
    } catch (err) {
      console.log('Erro ao salvar status do onboarding:', err);
      navigation.replace('Login');
    }
  };

  const scrollToNext = () => {
    if (currentIndex < slides.length - 1) {
      slidesRef.current.scrollToIndex({ index: currentIndex + 1 });
    } else {
      handleFinish();
    }
  };

  const Slide = ({ item }) => (
    <View style={styles.slideContainer}>
      <LinearGradient colors={item.colors} style={styles.iconCircle}>
        {item.icon}
      </LinearGradient>
      <View style={styles.textContainer}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.description}>{item.description}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={slides}
        renderItem={({ item }) => <Slide item={item} />}
        horizontal
        showsHorizontalScrollIndicator={false}
        pagingEnabled
        bounces={false}
        keyExtractor={(item) => item.id}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], {
          useNativeDriver: false,
        })}
        onViewableItemsChanged={viewableItemsChanged}
        viewabilityConfig={viewConfig}
        ref={slidesRef}
      />

      <View style={styles.footer}>
        <View style={styles.paginator}>
          {slides.map((_, i) => {
            const inputRange = [(i - 1) * width, i * width, (i + 1) * width];
            const dotWidth = scrollX.interpolate({
              inputRange,
              outputRange: [10, 24, 10],
              extrapolate: 'clamp',
            });
            const opacity = scrollX.interpolate({
              inputRange,
              outputRange: [0.3, 1, 0.3],
              extrapolate: 'clamp',
            });
            return (
              <Animated.View 
                style={[styles.dot, { width: dotWidth, opacity }]} 
                key={i.toString()} 
              />
            );
          })}
        </View>

        <TouchableOpacity style={styles.button} onPress={scrollToNext}>
          <Text style={styles.buttonText}>
            {currentIndex === slides.length - 1 ? 'Começar Agora' : 'Próximo'}
          </Text>
          <ChevronRight size={20} color="#FFF" />
        </TouchableOpacity>
        
        <TouchableOpacity onPress={handleFinish} style={styles.skipBtn}>
          <Text style={styles.skipText}>Pular</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  slideContainer: {
    width,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  iconCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 60,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 5,
  },
  textContainer: {
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  description: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  footer: {
    padding: 40,
    alignItems: 'center',
  },
  paginator: {
    flexDirection: 'row',
    height: 64,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    height: 10,
    borderRadius: 5,
    backgroundColor: '#0284C7',
    marginHorizontal: 6,
  },
  button: {
    backgroundColor: '#0284C7',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 20,
    width: '100%',
    shadowColor: '#0284C7',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '800',
    marginRight: 8,
  },
  skipBtn: {
    marginTop: 24,
  },
  skipText: {
    color: '#94A3B8',
    fontSize: 15,
    fontWeight: '600',
  },
});
