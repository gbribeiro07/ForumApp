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
};