import React, {useState, useContext} from "react";
import {View, Text, TextInput, Button, StyleSheet, Alert, TouchableOpacity} from 'react-native';
import Api from "../Services/Api";

const RegisterScreen = ({navigation}) => {
    const [username, setUsername] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')

    const handleRegister = async() => {
        try {
            const response = await Api.post('/auth/register', {username, email, password})
            Alert.alert('Sucesso', 'Usuário cadastrado com sucesso.')
            navigation.navigate('Login')
        } catch (error){
            console.error("Erro ao cadastrar", error.response.data || error.message);
            Alert.alert("Erro ao cadastrar", error.response.data.message || 'Ocorreu um erro ao cadastrar.')
        }
    }

    return (
        <View style={StyleSheet.container}>
            <Text style={StyleSheet.title}> Crie sua conta! </Text>
            <TextInput
                style={styles.input}
                placeholder="Nome do usuário"
                value={identifier}
                onChangeText={setUsername}
                autoCapitalize="none"
            />
            <TextInput
                style={styles.input}
                placeholder="Endereço de email"
                value={identifier}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
            />
            <TextInput
                style={styles.input}
                placeholder="Senha"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
            />
            <Button title="Cadastrar" onPress={handleRegister} />
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={StyleSheet.registerText}> Já tem conta? Faça o login.</Text>
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
 
 
export default RegisterScreen;