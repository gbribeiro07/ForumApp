import React, { useState, useContext } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, TouchableOpacity, SafeAreaView, StatusBar, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../context/AuthContext';
import CustomButton from '../components/CustomButton';
import theme from '../styles/theme';

const LoginScreen = ({ navigation }) => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useContext(AuthContext);

  const handleLogin = async () => {
    if (!identifier.trim() || !password.trim()) {
      Alert.alert('Campos Vazios', 'Por favor, preencha o usuário/email e a senha.');
      return;
    }

    setLoading(true);
    try {
      await signIn(identifier, password);
      // A navegação é tratada pelo AuthContext/AppNavigator
    } catch (error) {
      // O erro já é tratado e exibido pelo AuthContext, mas podemos logar se necessário
      console.error('Falha no login (LoginScreen):', error);
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
            <Ionicons name="chatbubbles-sharp" size={80} color={theme.colors.white} />
            <Text style={styles.title}>Bem-vindo ao DevSocial</Text>
            <Text style={styles.subtitle}>Conecte-se e compartilhe conhecimento.</Text>
        </View>

        <View style={styles.formContainer}>
            <View style={styles.inputContainer}>
                <Ionicons name="person-outline" size={22} color={theme.colors.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Usuário ou E-mail"
                  placeholderTextColor={theme.colors.textMuted}
                  value={identifier}
                  onChangeText={setIdentifier}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  returnKeyType="next"
                />
            </View>
            <View style={styles.inputContainer}>
                <Ionicons name="lock-closed-outline" size={22} color={theme.colors.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Senha"
                  placeholderTextColor={theme.colors.textMuted}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  returnKeyType="done"
                />
            </View>
            
            <CustomButton 
                title="Entrar" 
                onPress={handleLogin} 
                disabled={loading}
                loading={loading}
                variant="primary"
                style={{marginTop: theme.spacing.md}}
            />
        </View>

        <View style={styles.footer}>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={styles.registerText}>
                Não tem uma conta? <Text style={styles.registerLink}>Cadastre-se</Text>
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
  registerText: {
    color: theme.colors.white,
    fontSize: theme.typography.fontSizes.md,
  },
  registerLink: {
    fontWeight: theme.typography.fontWeights.bold,
    textDecorationLine: 'underline',
  },
});

export default LoginScreen;