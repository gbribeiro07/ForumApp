import React, {useState, useContext} from "react";
import {View, Text, TextInput, Button, StyleSheet, Alert, TouchableOpacity} from 'react-native';
import Api from "../Services/Api";
import AuthContext from "../Context/AuthContext";

const LoginScreen = ({navigation}) => {
    const [identifier, setIdentifier] = useState('') //login
    const [password, setPassword] = useState('') 
    const [signIn, setContext] = useState(AuthContext) 

    const handleLogin = async () => {
        try {
            const response = await Api.post('/auth/login', {identifier, password})
            Alert.alert('Sucesso', 'Login realizado com sucesso!')
            //chama signIn para salvar o token e atualizar estado global
            await signIn(response.data.token, response.data.user)
        } catch (error){
            console.error("Erro no login", error.response.data || error.message);
            Alert.alert("Erro no login", error.response.data.message || 'Ocorreu um erro ao logar.')
        }
    }

    return (
        <View style={StyleSheet.container}>
            <Text style={StyleSheet.title}> Bem-vindo! </Text>
            <TextInput
                style={styles.input}
                placeholder="Usuário ou E-mail"
                value={identifier}
                onChangeText={setIdentifier}
                autoCapitalize="none"
            />
            <TextInput
                style={styles.input}
                placeholder="Senha"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
            />
            <Button title="Entrar" onPress={handleLogin} />
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                <Text style={StyleSheet.registerText}> Não tem conta? Cadastre-se.</Text>
            </TouchableOpacity>
        </View>
    )
};

const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
      backgroundColor: '#f5f5f5',
    },
    title: {
      fontSize: 28,
      fontWeight: 'bold',
      marginBottom: 30,
      color: '#333',
    },
    input: {
      width: '100%',
      padding: 15,
      borderWidth: 1,
      borderColor: '#ddd',
      borderRadius: 8,
      marginBottom: 15,
      backgroundColor: '#fff',
    },
    registerText: {
      marginTop: 20,
      color: '#007bff',
      textDecorationLine: 'underline',
    },
  });
 
 
export default LoginScreen;