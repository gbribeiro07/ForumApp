import React from "react";
import { NavigationContainer } from "@react-navigation/native";
//npm i @react-navigation/native

import {createNativeStackNavigator} from "@react-navigation/native-stack";
import {View, ActivityIndicator} from "react-native";
import AuthContext from "./Context/AuthContext";
import AuthStack from "./screens/AuthStack";
import HomeScreen from "./screens/HomeScreen";
import ProfileScreen from "./screens/ProfileScreen";
import PostDetailScreen from "./screens/PostDetailScreen";
import EditProfileScreen from "./screens/EditProfileScreen";

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
    const {userToken, isLoading} = useContext(AuthContext)

    if (isLoading) {
        return (
            <View style={{flex:1, justifyContent: 'center', alignItems: 'center'}}>
                <ActivityIndicator size='large' color='#0000ff' />
            </View>
        )
    }

    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{headerShow: false}}>
                {userToken ? (
                    <>
                        <Stack.Screen name="Home" component={HomeScreen} />
                        <Stack.Screen name="PostDetail" component={PostDetailScreen} />
                        <Stack.Screen name="Profile" component={ProfileScreen} />
                        <Stack.Screen name="EditProfile" component={EditProfileScreen} />
                    </>
                ) : (
                    <Stack.Screen name="Auth" component={AuthStack} />
                )}
            </Stack.Navigator>
        </NavigationContainer>
    )
};

export default AppNavigator;
