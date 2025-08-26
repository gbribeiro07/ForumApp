// App.js (na raiz do seu projeto meu-app-forum)

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import AppNavigator from './src/AppNavigator';
import { AuthProvider } from './src/context/AuthContext'; // Importa o provedor
import theme from './src/styles/theme';

// Reduzir verbosidade do console em produção
if (!__DEV__) {
  console.log = () => {};
  console.warn = () => {};
  console.error = () => {};
}

// Componente para erro de carregamento
const ErrorBoundary = ({ children }) => {
  const [hasError, setHasError] = React.useState(false);
  const [errorInfo, setErrorInfo] = React.useState('');
  const [connectionRetryCount, setConnectionRetryCount] = React.useState(0);

  React.useEffect(() => {
    const errorHandler = (error) => {
      console.error('App Error:', error);
      setHasError(true);
      setErrorInfo(error.toString());
      
      // Detectar erros específicos de conexão
      if (error.toString().includes('Network') || 
          error.toString().includes('ECONNREFUSED') ||
          error.toString().includes('timeout')) {
        setErrorInfo('Erro de conexão com o servidor. ' +
          'Verifique se o servidor está rodando e acessível. ' +
          'Para dispositivos iOS físicos, verifique se o servidor está acessível pela rede.');
      }
      
      return true; // Previne que o erro seja propagado
    };

    // Adiciona o handler de erro global
    const subscription = global.ErrorUtils ? 
      global.ErrorUtils.setGlobalHandler(errorHandler) : null;

    return () => {
      // Remove o handler ao desmontar
      if (subscription && global.ErrorUtils) {
        global.ErrorUtils.setGlobalHandler(subscription);
      }
    };
  }, []);

  const handleRetry = () => {
    setConnectionRetryCount(prev => prev + 1);
    setHasError(false);
    // Força uma reconexão com o servidor
    import('./src/services/api').then(api => {
      if (api.testServerConnection) {
        api.testServerConnection();
      }
    }).catch(err => console.error('Falha ao importar API:', err));
  };

  if (hasError) {
    const isConnectionError = errorInfo.includes('conexão') || 
                              errorInfo.includes('Network') ||
                              errorInfo.includes('ECONNREFUSED') ||
                              errorInfo.includes('timeout');
    
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>
          {isConnectionError ? 'Erro de Conexão' : 'Ops! Algo deu errado.'}
        </Text>
        <Text style={styles.errorMessage}>{errorInfo}</Text>
        
        {isConnectionError && (
          <Text style={styles.errorTips}>
            Verifique se:
            {'\n'}- O servidor está rodando (npm start na pasta server)
            {'\n'}- Você está conectado à mesma rede Wi-Fi do servidor
            {'\n'}- O firewall permite conexões na porta 3001
          </Text>
        )}
        
        <Text 
          style={styles.resetButton}
          onPress={handleRetry}
        >
          Tentar Novamente ({connectionRetryCount})
        </Text>
      </View>
    );
  }

  return children;
};

export default function App() {
  // Verificar se o tema está carregando corretamente
  console.log('Tema carregado:', Object.keys(theme));
  
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AppNavigator />
      </AuthProvider>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#dc3545',
  },
  errorMessage: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    color: '#343a40',
  },
  errorTips: {
    fontSize: 14,
    textAlign: 'left',
    marginVertical: 20,
    color: '#495057',
    backgroundColor: '#e9ecef',
    padding: 15,
    borderRadius: 8,
    width: '90%',
  },
  resetButton: {
    fontSize: 16,
    color: '#fff',
    backgroundColor: '#0d6efd',
    padding: 12,
    borderRadius: 8,
    overflow: 'hidden',
  },
});