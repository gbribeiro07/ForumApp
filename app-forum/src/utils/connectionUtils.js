// src/utils/connectionUtils.js

import { Alert, Platform } from 'react-native';
import api, { checkConnection } from '../services/api';

/**
 * Utilitário para lidar com problemas de conexão específicos de cada plataforma
 */
export const handleConnectionIssues = async () => {
  try {
    // Usar a função checkConnection para verificar conexão
    const connected = await checkConnection();
    
    if (connected) {
      return true;
    }
    
    // Se não conseguiu conectar, mostre instruções específicas para cada plataforma
    const platformSpecificMessage = getPlatformSpecificConnectionMessage();
    Alert.alert(
      "Problema de conexão",
      platformSpecificMessage,
      [
        { 
          text: "Tentar novamente", 
          onPress: async () => {
            try {
              return await checkConnection();
            } catch (e) {
              return false;
            }
          }
        },
        { text: "OK", style: "default" }
      ]
    );
    
    return false;
  } catch (error) {
    console.error('Erro ao verificar conexão:', error);
    return false;
  }
};

/**
 * Retorna uma mensagem específica para cada plataforma
 */
export const getPlatformSpecificConnectionMessage = () => {
  switch (Platform.OS) {
    case 'ios':
      return "Não foi possível conectar ao servidor.\n\n" +
        "Verifique se:\n" +
        "• O servidor está rodando (npm start na pasta server)\n" +
        "• Para o simulador iOS, verifique se o servidor está rodando em localhost:3001\n" +
        "• Para dispositivo físico, o servidor e o dispositivo devem estar na mesma rede Wi-Fi\n" +
        "• O endereço IP do servidor está corretamente configurado\n" +
        "• As portas não estão sendo bloqueadas por firewall";
      
    case 'android':
      return "Não foi possível conectar ao servidor.\n\n" +
        "Verifique se:\n" +
        "• O servidor está rodando (npm start na pasta server)\n" +
        "• Para emuladores Android, use 10.0.2.2 em vez de localhost\n" +
        "• Para dispositivo físico, o servidor e o dispositivo devem estar na mesma rede Wi-Fi\n" +
        "• O endereço IP do servidor está corretamente configurado";
      
    case 'web':
      return "Não foi possível conectar ao servidor.\n\n" +
        "Verifique se:\n" +
        "• O servidor está rodando (npm start na pasta server)\n" +
        "• O servidor está rodando em localhost:3001\n" +
        "• O console do navegador tem mais detalhes sobre o erro";
      
    default:
      return "Não foi possível conectar ao servidor. Verifique se ele está rodando e acessível.";
  }
};
