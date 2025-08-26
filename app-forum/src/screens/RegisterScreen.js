// src/screens/RegisterScreen.js

import React, { useState, useContext } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, TouchableOpacity, SafeAreaView, StatusBar, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../services/api';
import CustomButton from '../components/CustomButton';
import theme from '../styles/theme';
import { AuthContext } from '../context/AuthContext';

const RegisterScreen = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useContext(AuthContext);

  const handleRegister = async () => {
    if (!username.trim() || !email.trim() || !password.trim()) {
      Alert.alert('Campos Vazios', 'Por favor, preencha todos os campos.');
      return;
    }
    if (password.length < 6) {
        Alert.alert('Senha Curta', 'A senha deve ter pelo menos 6 caracteres.');
        return;
    }

    setLoading(true);
    try {
      await api.post('/auth/register', { username, email, password });
      Alert.alert(
        'Cadastro Realizado!',
        'Sua conta foi criada com sucesso. Você será logado automaticamente.',
        [{ text: 'OK', onPress: () => signIn(email, password) }]
      );
    } catch (error) {
      console.error('Erro no cadastro:', error.response?.data || error.message);
      Alert.alert('Erro no Cadastro', error.response?.data?.message || 'Não foi possível criar a conta. Tente outro usuário ou email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.primaryDark} />
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                <Ionicons name="arrow-back-circle" size={40} color={theme.colors.white} />
            </TouchableOpacity>
            <Ionicons name="person-add-sharp" size={70} color={theme.colors.white} />
            <Text style={styles.title}>Crie sua Conta</Text>
            <Text style={styles.subtitle}>É rápido e fácil. Vamos começar!</Text>
        </View>

        <View style={styles.formContainer}>
            <View style={styles.inputContainer}>
                <Ionicons name="person-circle-outline" size={22} color={theme.colors.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Nome de Usuário"
                  placeholderTextColor={theme.colors.textMuted}
                  value={username}
                  onChangeText={setUsername}
                  autoCapitalize="none"
                  returnKeyType="next"
                />
            </View>
            <View style={styles.inputContainer}>
                <Ionicons name="mail-outline" size={22} color={theme.colors.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="E-mail"
                  placeholderTextColor={theme.colors.textMuted}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  returnKeyType="next"
                />
            </View>
            <View style={styles.inputContainer}>
                <Ionicons name="lock-closed-outline" size={22} color={theme.colors.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Senha (mín. 6 caracteres)"
                  placeholderTextColor={theme.colors.textMuted}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  returnKeyType="done"
                />
            </View>
            
            <CustomButton 
                title="Cadastrar" 
                onPress={handleRegister} 
                disabled={loading}
                loading={loading}
                variant="primary"
                style={{marginTop: theme.spacing.md}}
            />
        </View>

        <View style={styles.footer}>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginText}>
                Já tem uma conta? <Text style={styles.loginLink}>Faça Login</Text>
              </Text>
            </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.primary,
  },
  keyboardView: {
    flex: 1,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
  },
  backButton: {
    position: 'absolute',
    top: 0,
    left: theme.spacing.md,
    zIndex: 1,
  },
  title: {
    fontSize: theme.typography.fontSizes.xxxl,
    fontWeight: theme.typography.fontWeights.bold,
    color: theme.colors.white,
    marginTop: theme.spacing.md,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: theme.typography.fontSizes.lg,
    color: theme.colors.primaryLight,
    marginTop: theme.spacing.sm,
    textAlign: 'center',
  },
  formContainer: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
    marginHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.white,
    borderRadius: theme.borders.radius.xl,
    ...theme.shadows.lg,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borders.radius.md,
    marginBottom: theme.spacing.md,
    backgroundColor: theme.colors.background,
  },
  inputIcon: {
    paddingHorizontal: theme.spacing.md,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: theme.typography.fontSizes.md,
    color: theme.colors.text,
  },
  footer: {
    alignItems: 'center',
    marginTop: theme.spacing.xl,
  },
  loginText: {
    color: theme.colors.white,
    fontSize: theme.typography.fontSizes.md,
  },
  loginLink: {
    fontWeight: theme.typography.fontWeights.bold,
    textDecorationLine: 'underline',
  },
});

export default RegisterScreen;