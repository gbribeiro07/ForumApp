// src/context/AuthContext.js

import React, { createContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import api, { getAPI_URL } from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [userToken, setUserToken] = useState(null);
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Função para fazer login e salvar o token e o usuário
  const signIn = useCallback(async (identifier, password) => {
    try {
      console.log('AuthContext: Iniciando processo de login');
      
      // Fazer a chamada de login à API
      const response = await api.post('/auth/login', { 
        identifier, 
        password 
      });
      
      const { token, user } = response.data;
      
      // Garantir que a URL da foto de perfil está completa
      if (user.profile_picture_url && !user.profile_picture_url.startsWith('http')) {
        user.profile_picture_url = `${getAPI_URL()}${user.profile_picture_url}`;
      }
      
      // Salvar token e dados do usuário
      await AsyncStorage.setItem('userToken', token);
      await AsyncStorage.setItem('userData', JSON.stringify(user));
      
      // Atualizar estados
      setUserToken(token);
      setUserData(user);
      
      console.log('AuthContext: Login concluído, token e dados salvos');
      return true;
    } catch (error) {
      console.error('AuthContext: Erro no login:', error.response?.data || error.message);
      
      let mensagemErro = 'Ocorreu um erro durante o login.';
      
      if (error.response) {
        if (error.response.status === 401) {
          mensagemErro = 'Usuário ou senha incorretos.';
        } else if (error.response.data?.message) {
          mensagemErro = error.response.data.message;
        }
      } else if (error.message.includes('Network')) {
        mensagemErro = 'Não foi possível conectar ao servidor. Verifique sua conexão.';
      }
      
      Alert.alert('Erro de Login', mensagemErro);
      return false;
    }
  }, []);

  // Função para remover o token ao fazer logout
  const signOut = useCallback(async () => {
    console.log('AuthContext: Iniciando processo de logout');
    try {
      // Limpar o AsyncStorage primeiro
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('userData');
      
      console.log('AuthContext: AsyncStorage limpo, atualizando estados...');
      
      // Limpar os estados depois
      setUserToken(null);
      setUserData(null);
      
      console.log('AuthContext: Logout concluído com sucesso');
      return true;
    } catch (error) {
      console.error('AuthContext: Erro ao fazer logout:', error);
      Alert.alert('Erro de Logout', 'Ocorreu um erro ao tentar sair da aplicação.');
      return false;
    }
  }, []);
  
  // Atualizar dados do usuário
  const updateUserData = useCallback(async (newUserData) => {
    try {
      console.log('AuthContext: Atualizando dados do usuário...', newUserData);
      
      if (!userData) {
        console.error('AuthContext: Tentativa de atualizar usuário mas userData é null');
        return false;
      }
      
      // Cria uma cópia para evitar modificar o objeto original
      const updatedData = {...newUserData};
      
      // Garante que a URL da foto de perfil esteja sempre completa
      if (updatedData.profile_picture_url && !updatedData.profile_picture_url.startsWith('http')) {
        console.log('AuthContext: Convertendo URL relativa para absoluta');
        updatedData.profile_picture_url = `${getAPI_URL()}${updatedData.profile_picture_url}`;
      }
      
      // Mescla os dados atuais com os novos dados
      const updatedUserData = { ...userData, ...updatedData };
      console.log('AuthContext: Dados mesclados:', updatedUserData);
      
      // Salva no AsyncStorage
      await AsyncStorage.setItem('userData', JSON.stringify(updatedUserData));
      console.log('AuthContext: Dados salvos no AsyncStorage');
      
      // Atualiza o estado
      setUserData(updatedUserData);
      console.log('AuthContext: Estado atualizado com sucesso');
      
      return true;
    } catch (error) {
      console.error('AuthContext: Erro ao atualizar dados do usuário:', error);
      return false;
    }
  }, [userData, getAPI_URL]);

  // Carregar token e dados do usuário ao iniciar o aplicativo
  useEffect(() => {
    const bootstrapAsync = async () => {
      setIsLoading(true);
      try {
        console.log('AuthContext: Carregando dados de autenticação...');
        
        // Buscar token e dados do usuário
        const token = await AsyncStorage.getItem('userToken');
        const userDataString = await AsyncStorage.getItem('userData');
        
        // Se existe token, carregar nos estados
        if (token) {
          console.log('AuthContext: Token encontrado no AsyncStorage');
          setUserToken(token);
          
          // Se existem dados do usuário, carregar também
          if (userDataString) {
            console.log('AuthContext: Dados do usuário encontrados no AsyncStorage');
            setUserData(JSON.parse(userDataString));
          }
        } else {
          console.log('AuthContext: Nenhum token encontrado no AsyncStorage');
        }
      } catch (error) {
        console.error('AuthContext: Erro ao carregar dados de autenticação:', error);
        // Em caso de erro, limpar tudo para evitar estados inconsistentes
        await AsyncStorage.removeItem('userToken');
        await AsyncStorage.removeItem('userData');
        setUserToken(null);
        setUserData(null);
      } finally {
        setIsLoading(false);
      }
    };

    bootstrapAsync();
  }, []);

  return (
    <AuthContext.Provider value={{ 
      userToken, 
      userData, 
      isLoading, 
      signIn, 
      signOut, 
      updateUser: updateUserData 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;