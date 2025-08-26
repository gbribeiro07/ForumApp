// src/services/api.js

import axios from 'axios';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// A URL base do seu backend
// Configuração dinâmica baseada na plataforma
let API_BASE_URL;
let SERVER_BASE_URL; // URL base do servidor (sem /api)
const SERVER_PORT = 3001;

// Lista de possíveis IPs/hosts para tentar conectar
const possibleIPs = [
  'localhost',       // Para web/emulador iOS
  '127.0.0.1',       // Localhost IP
  '172.20.91.144',   // IP atual do dispositivo (pode mudar)
  '10.0.2.2',        // Para emulador Android
  '10.0.3.2'         // Para Genymotion
];

// Função para gerar a URL base
const getApiUrl = (ip) => `http://${ip}:${SERVER_PORT}/api`;
const getServerUrl = (ip) => `http://${ip}:${SERVER_PORT}`;

// Detectar o IP do servidor automaticamente
const detectServerIP = async () => {
  console.log('🔍 Iniciando detecção do servidor...');
  
  // Testar endpoint específico para teste de conexão, se existir
  const testEndpoint = '/test-connection';
  // Caso não exista endpoint de teste, tentamos um fallback
  const fallbackEndpoint = '/';
  
  for (const ip of possibleIPs) {
    try {
      const testUrl = getApiUrl(ip);
      console.log(`Testando conexão com ${testUrl}${testEndpoint}...`);
      
      try {
        // Primeira tentativa com o endpoint de teste
        const response = await axios.get(`${testUrl}${testEndpoint}`, { 
          timeout: 3000,
          headers: { 'Accept': 'application/json' }
        });
        
        if (response.status === 200) {
          console.log(`✅ Conexão bem-sucedida com ${testUrl}`);
          API_BASE_URL = testUrl;
          SERVER_BASE_URL = getServerUrl(ip);
          return true;
        }
      } catch (testError) {
        // Se falhou com endpoint de teste, tenta com fallback
        console.log(`⚠️ Endpoint de teste falhou, tentando fallback: ${testError.message}`);
        
        try {
          const fallbackResponse = await axios.get(`${testUrl}${fallbackEndpoint}`, { 
            timeout: 3000,
            headers: { 'Accept': 'application/json' }
          });
          
          if (fallbackResponse.status === 200 || fallbackResponse.status === 404) {
            // Se receber qualquer resposta HTTP válida, consideramos o servidor online
            console.log(`✅ Conexão bem-sucedida (fallback) com ${testUrl}`);
            API_BASE_URL = testUrl;
            SERVER_BASE_URL = getServerUrl(ip);
            return true;
          }
        } catch (fallbackError) {
          console.log(`❌ Fallback também falhou: ${fallbackError.message}`);
        }
      }
    } catch (error) {
      console.log(`❌ Falha ao conectar em ${getApiUrl(ip)}: ${error.message}`);
    }
  }
  
  // Se chegamos aqui, não conseguimos conectar a nenhum IP
  console.error('❌ Não foi possível conectar ao servidor em nenhum dos IPs');
  return false;
};

// Configuração inicial baseada na plataforma
if (Platform.OS === 'android') {
  // Para emuladores Android
  if (Platform.constants?.uiMode?.includes('tv')) {
    API_BASE_URL = getApiUrl('localhost');
    SERVER_BASE_URL = getServerUrl('localhost');
  } else {
    // Para dispositivos Android físicos
    API_BASE_URL = getApiUrl('localhost');
    SERVER_BASE_URL = getServerUrl('localhost');
  }
} else if (Platform.OS === 'ios') {
  // Para iOS - emulador usa um IP diferente de localhost
  // Em dispositivos físicos, é preciso usar o IP real da máquina na mesma rede
  API_BASE_URL = getApiUrl('localhost'); // Vai tentar auto-detectar em seguida
  SERVER_BASE_URL = getServerUrl('localhost');
} else {
  // Web ou outros dispositivos
  API_BASE_URL = getApiUrl('localhost');
  SERVER_BASE_URL = getServerUrl('localhost');
}

// Criar instância do axios com timeout aumentado
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 segundos de timeout
});

// Função para converter URLs relativas em URLs absolutas
const convertImageUrl = (relativeUrl) => {
  if (!relativeUrl || typeof relativeUrl !== 'string' || relativeUrl.trim() === '') return null;
  
  // Já é uma URL completa e válida
  if (relativeUrl.startsWith('http://') || relativeUrl.startsWith('https://')) {
    try {
      new URL(relativeUrl); // Validar se a URL está bem formada
      return relativeUrl;
    } catch {
      console.warn('URL malformada detectada:', relativeUrl);
      return null;
    }
  }
  
  // Caminho relativo válido
  if (relativeUrl.startsWith('/uploads/')) {
    try {
      const fullUrl = `${SERVER_BASE_URL}${relativeUrl}`;
      console.log('Convertendo URL relativa para absoluta:', relativeUrl, ' -> ', fullUrl);
      return fullUrl;
    } catch (error) {
      console.warn('Erro ao formar URL completa:', relativeUrl, error);
      return null;
    }
  }
  
  console.warn('URL não reconhecida:', relativeUrl);
  return null;
};

// Interceptor para adicionar token de autenticação automaticamente
api.interceptors.request.use(async (config) => {
  try {
    const token = await AsyncStorage.getItem('userToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (error) {
    console.warn('Erro ao obter token para requisição:', error);
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Interceptor para resposta - transformar URLs de imagens
api.interceptors.response.use(response => {
  // Debug da resposta
  const url = response.config?.url;
  console.log(`📥 Resposta de ${url}: Status ${response.status}`);
  
  // Se for um array de objetos (como lista de posts)
  if (Array.isArray(response.data)) {
    response.data = response.data.map(item => {
      if (item.image_url) {
        item.image_url = convertImageUrl(item.image_url);
      }
      if (item.profile_picture_url) {
        item.profile_picture_url = convertImageUrl(item.profile_picture_url);
      }
      return item;
    });
  } 
  // Se for um único objeto
  else if (typeof response.data === 'object' && response.data !== null) {
    if (response.data.image_url) {
      response.data.image_url = convertImageUrl(response.data.image_url);
    }
    if (response.data.profile_picture_url) {
      response.data.profile_picture_url = convertImageUrl(response.data.profile_picture_url);
    }
    // Para o retorno de upload de imagens
    if (response.data.imageUrl) {
      console.log('Processando imageUrl na resposta:', response.data.imageUrl);
      response.data.imageUrl = convertImageUrl(response.data.imageUrl);
      console.log('imageUrl processada:', response.data.imageUrl);
    }
  }
  
  // Log para debug de endpoints específicos
  if (url?.includes('/upload/')) {
    console.log('Resposta de upload detalhada:', response.data);
  }
  
  return response;
}, error => {
  console.log('❌ API Error:', error.message);
  
  // Log detalhado de erros para upload
  const url = error.config?.url;
  if (url?.includes('/upload/')) {
    console.error('Detalhes do erro de upload:', error);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
  
  if (!error.response) {
    console.error('Erro de conexão ao servidor:', error.message);
    if (error.message.includes('Network Error')) {
      console.error('Erro de rede detectado. Tentando reconectar...');
      // Tentar detectar servidor novamente em caso de erro
      detectServerIP().then(connected => {
        if (connected) {
          console.log('Reconexão bem-sucedida!');
          api.defaults.baseURL = API_BASE_URL;
        }
      });
    }
  }
  
  return Promise.reject(error);
});

// Tentar detectar o servidor na inicialização
detectServerIP().then(connected => {
  if (connected) {
    console.log('🚀 Servidor detectado automaticamente! URL:', API_BASE_URL);
    api.defaults.baseURL = API_BASE_URL;
  } else {
    console.log('⚠️ Não foi possível detectar o servidor automaticamente.');
    console.log('⚠️ Se você estiver usando iOS:');
    console.log('  • Em emulador: Verifique se o backend está rodando em "localhost:3001"');
    console.log('  • Em dispositivo físico: Verifique se o backend está rodando e acessível pela rede');
    console.log('⚠️ Usando URL padrão:', API_BASE_URL);
  }
}).catch(err => {
  console.log('Erro ao detectar servidor:', err);
});

// Função para verificar a conexão com o servidor
const checkConnection = async () => {
  return await detectServerIP();
};

// Função para obter a URL da API
export const getAPI_URL = () => SERVER_BASE_URL;

// Exportar tudo de uma vez só
export { convertImageUrl, SERVER_BASE_URL, checkConnection };
export default api;