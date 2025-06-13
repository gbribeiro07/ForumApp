import React, {createContext, useState, useEffect} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
//npx expo install @react-native-async-storage/async-storage

const AuthContext = createContext();
//funciona para salvar o token e o user (se necessário)
export const AuthProvider = ({children}) => {
    const [userToken, setUserToken] = useState(null)
    const [isLoading, setIsLoading] = useState(true)
    //isLoading vai carregar o token ao iniciar 

    const SignIn = async (token, userData) => {
        try{
            await AsyncStorage.setItem('userToken', token)
            setUserToken(token)
            //await AsyncStorage.setItem('userToken', JSON.stringfy(userData))
            //caso precise salvar os dados junto
        } catch {
            consoler.error('Erro ao salvar token do user.', e)
        }
    }
}