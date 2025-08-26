// src/AppNavigator.js

import React, { useContext, useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, ActivityIndicator, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';

import { AuthContext } from './context/AuthContext';
import AuthStack from './screens/AuthStack';
import HomeScreen from './screens/HomeScreen';
import PostDetailScreen from './screens/PostDetailScreen';
import ProfileScreen from './screens/ProfileScreen';
import EditProfileScreen from './screens/EditProfileScreen';
import theme from './styles/theme';
import api, { checkConnection } from './services/api';
import { handleConnectionIssues } from './utils/connectionUtils';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  const { userToken, isLoading } = useContext(AuthContext);
  const [connectionChecking, setConnectionChecking] = useState(true);
  const [connectionError, setConnectionError] = useState(false);
  
  // Verificar conexão com o servidor ao iniciar
  useEffect(() => {
    const verifyConnection = async () => {
      setConnectionChecking(true);
      try {
        // Usar a função de verificação de conexão
        const connected = await checkConnection();
        setConnectionError(!connected);
      } catch (error) {
        console.error('Erro ao verificar conexão:', error);
        setConnectionError(true);
      } finally {
        setConnectionChecking(false);
      }
    };
    
    verifyConnection();
  }, []);
  
  // Tela de carregamento
  if (isLoading || connectionChecking) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background }}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={{ marginTop: 20, color: theme.colors.text }}>
          {connectionChecking ? 'Conectando ao servidor...' : 'Carregando...'}
        </Text>
      </View>
    );
  }
  
  // Tela de erro de conexão
  if (connectionError) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>Não foi possível conectar ao servidor</Text>
        <Text style={styles.errorMessage}>
          {Platform.OS === 'ios' 
            ? 'No iOS, verifique se o servidor está rodando e acessível.\nPara dispositivos físicos, o servidor e o dispositivo devem estar na mesma rede Wi-Fi.' 
            : 'Verifique se o servidor está rodando e acessível.'}
        </Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={async () => {
            setConnectionChecking(true);
            const success = await handleConnectionIssues();
            setConnectionError(!success);
            setConnectionChecking(false);
          }}
        >
          <Text style={styles.retryText}>Tentar Novamente</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator 
        screenOptions={{ 
          headerShown: false,
        }}
      >
        {userToken ? (
          <>
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="PostDetail" component={PostDetailScreen} />
            <Stack.Screen name="Profile" component={ProfileScreen} />
            <Stack.Screen name="EditProfile" component={EditProfileScreen} />
          </>
        ) : (
          <Stack.Screen name="Auth" component={AuthStack} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

// Estilos para a tela de erro de conexão
const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    padding: 20,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.error || '#f44336',
    marginBottom: 10,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 14,
    color: theme.colors.text,
    marginBottom: 30,
    textAlign: 'center',
    lineHeight: 20,
  },
  retryButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  retryText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  }
});

export default AppNavigator;
