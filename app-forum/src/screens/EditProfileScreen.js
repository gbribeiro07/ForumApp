// src/screens/EditProfileScreen.js

import React, { useState, useContext, useEffect } from 'react';
import {
  View, Text, TextInput, StyleSheet, Alert,
  ScrollView, ActivityIndicator, Image, TouchableOpacity,
  Platform
} from 'react-native';
import { AuthContext } from '../context/AuthContext';
import api, { getAPI_URL } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import theme from '../styles/theme';
import CustomButton from '../components/CustomButton';

const EditProfileScreen = ({ route, navigation }) => {
  const { userData, updateUser } = useContext(AuthContext);
  const initialUser = userData; // Usar dados do usuário do contexto

  const [username, setUsername] = useState(initialUser.username);
  const [email, setEmail] = useState(initialUser.email);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  
  // Use a local state for the image URI to handle both remote URLs and local file URIs
  const [imageUri, setImageUri] = useState(initialUser.profile_picture_url);
  const [selectedImageFile, setSelectedImageFile] = useState(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  useEffect(() => {
    // Request permissions when the component mounts
    (async () => {
      if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permissão Negada', 'Desculpe, precisamos de permissões de galeria para isso funcionar!');
        }
      }
    })();
  }, []);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const source = result.assets[0];
      setImageUri(source.uri); // Update the displayed image immediately
      setSelectedImageFile(source); // Store the selected image file info
    }
  };

  const handleUpdateProfile = async () => {
    if (newPassword && newPassword !== confirmNewPassword) {
      Alert.alert('Erro', 'A nova senha e a confirmação de senha não coincidem.');
      return;
    }

    setIsSubmitting(true);
    try {
      const userToken = await AsyncStorage.getItem('userToken');
      if (!userToken) {
        Alert.alert('Erro de Autenticação', 'Você não está logado.');
        // signOut(); // signOut is not in context here, maybe pass it or handle differently
        navigation.navigate('Login');
        return;
      }

      let uploadedImageUrl = initialUser.profile_picture_url;

      if (selectedImageFile) {
        const formData = new FormData();
        const uri = selectedImageFile.uri;
        const uriParts = uri.split('.');
        const fileType = uriParts[uriParts.length - 1];
        
        // Ajustar o tipo da imagem com base na extensão
        let fileTypeAdjusted;
        switch (fileType.toLowerCase()) {
          case 'jpg':
          case 'jpeg':
            fileTypeAdjusted = 'jpeg';
            break;
          case 'png':
            fileTypeAdjusted = 'png';
            break;
          case 'gif':
            fileTypeAdjusted = 'gif';
            break;
          case 'webp':
            fileTypeAdjusted = 'webp';
            break;
          default:
            fileTypeAdjusted = 'jpeg'; // fallback para o mais comum
        }
        
        // Criar blob para a imagem
        const imageBlob = {
          uri,
          name: `profile_photo_${Date.now()}.${fileType}`,
          type: `image/${fileTypeAdjusted}`,
        };
        
        formData.append('profilePicture', imageBlob);

        console.log('Enviando upload de imagem:', uri);
        console.log('FormData criado:', JSON.stringify(imageBlob));
        
        try {
          setUploadingPhoto(true);
          // Desativar o timeout para uploads grandes
          const uploadResponse = await api.post('/upload/profile-picture', formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
              'Authorization': `Bearer ${userToken}`,
            },
            timeout: 60000, // 60 segundos para uploads
          });
          
          if (uploadResponse.data && uploadResponse.data.imageUrl) {
            uploadedImageUrl = uploadResponse.data.imageUrl; // This should be an absolute URL from the server
            console.log('Upload bem-sucedido, URL recebida:', uploadedImageUrl);
          } else {
            console.error('Erro: resposta de upload não contém imageUrl', uploadResponse.data);
            Alert.alert('Erro de Upload', 'Resposta inválida do servidor ao fazer upload da imagem.');
            setIsSubmitting(false);
            setUploadingPhoto(false);
            return;
          }
        } catch (uploadError) {
          console.error('Erro ao fazer upload da imagem:', uploadError);
          
          if (uploadError.response) {
            console.error('Detalhes da resposta de erro:', {
              status: uploadError.response.status,
              data: uploadError.response.data
            });
          }
          
          Alert.alert('Erro de Upload', 'Não foi possível fazer upload da sua nova foto de perfil. Verifique sua conexão.');
          setIsSubmitting(false);
          setUploadingPhoto(false);
          return;
        } finally {
          setUploadingPhoto(false);
        }
      }

      const updateData = {
        username: username.trim() !== initialUser.username ? username.trim() : undefined,
        email: email.trim() !== initialUser.email ? email.trim() : undefined,
        profile_picture_url: uploadedImageUrl !== initialUser.profile_picture_url ? uploadedImageUrl : undefined,
      };

      if (newPassword) {
        updateData.old_password = oldPassword;
        updateData.new_password = newPassword;
      }

      const filteredUpdateData = Object.fromEntries(
        Object.entries(updateData).filter(([, value]) => value !== undefined)
      );

      if (Object.keys(filteredUpdateData).length === 0) {
        Alert.alert('Aviso', 'Nenhuma alteração detectada para salvar.');
        setIsSubmitting(false);
        return;
      }

      const response = await api.put('/users/me', filteredUpdateData, {
        headers: { Authorization: `Bearer ${userToken}` }
      });

      // Buscar dados atualizados do usuário diretamente do servidor
      try {
        const userResponse = await api.get('/users/me', {
          headers: { Authorization: `Bearer ${userToken}` }
        });
        
        const serverUserData = userResponse.data;
        
        // Garantir que a URL da imagem seja absoluta
        if (serverUserData.profile_picture_url && !serverUserData.profile_picture_url.startsWith('http')) {
          serverUserData.profile_picture_url = `${getAPI_URL()}${serverUserData.profile_picture_url}`;
        }
        
        console.log('Dados atualizados recebidos do servidor:', serverUserData);
        
        // Atualizar contexto com dados frescos do servidor
        const success = await updateUser(serverUserData);
        
        if (success) {
          console.log('Perfil atualizado com sucesso no contexto');
          Alert.alert('Sucesso', 'Seu perfil foi atualizado com sucesso!', [
            { text: 'OK', onPress: () => navigation.goBack() }
          ]);
        } else {
          console.error('Falha ao atualizar perfil no contexto');
          Alert.alert('Atenção', 'Seu perfil foi atualizado no servidor, mas houve um problema ao salvar localmente. Tente fazer login novamente.');
          navigation.goBack();
        }
      } catch (fetchError) {
        console.error('Erro ao buscar dados atualizados do usuário:', fetchError);
        Alert.alert('Sucesso parcial', 'Seu perfil foi atualizado, mas não foi possível obter os dados mais recentes.');
        navigation.goBack();
      }

    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      
      // Log detalhado para debug
      if (error.response) {
        console.error('Resposta do servidor:', error.response.data);
        console.error('Status code:', error.response.status);
        console.error('Headers:', error.response.headers);
      } else if (error.request) {
        console.error('Sem resposta do servidor. Request:', error.request);
      } else {
        console.error('Erro na configuração da requisição:', error.message);
      }
      
      let errorMessage = 'Ocorreu um erro ao atualizar o perfil.';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message.includes('Network')) {
        errorMessage = 'Erro de conexão. Verifique sua internet e tente novamente.';
      }
      
      Alert.alert('Erro', errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={28} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Editar Perfil</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <TouchableOpacity onPress={pickImage} style={styles.profilePictureContainer}>
          <Image 
            source={imageUri ? { uri: imageUri } : require('../../assets/icon.png')} 
            style={styles.profilePicture} 
          />
          <View style={styles.cameraIconOverlay}>
            <Ionicons name="camera" size={24} color={theme.colors.white} />
          </View>
        </TouchableOpacity>
        <Text style={styles.changePhotoText}>Trocar foto de perfil</Text>

        <View style={styles.inputGroup}>
            <Text style={styles.label}>Nome de Usuário</Text>
            <TextInput
              style={styles.input}
              placeholder="Digite seu nome de usuário"
              placeholderTextColor={theme.colors.textMuted}
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
            />
            <Text style={styles.label}>E-mail</Text>
            <TextInput
              style={styles.input}
              placeholder="Digite seu e-mail"
              placeholderTextColor={theme.colors.textMuted}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
        </View>

        <View style={styles.divider} />

        <View style={styles.inputGroup}>
            <Text style={styles.sectionTitle}>Mudar Senha (Opcional)</Text>
            <Text style={styles.label}>Senha Antiga</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor={theme.colors.textMuted}
              value={oldPassword}
              onChangeText={setOldPassword}
              secureTextEntry
            />
            <Text style={styles.label}>Nova Senha</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor={theme.colors.textMuted}
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
            />
            <Text style={styles.label}>Confirmar Nova Senha</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor={theme.colors.textMuted}
              value={confirmNewPassword}
              onChangeText={setConfirmNewPassword}
              secureTextEntry
            />
        </View>

        <CustomButton
          title={isSubmitting ? "Salvando..." : "Salvar Alterações"}
          onPress={handleUpdateProfile}
          disabled={isSubmitting}
          variant="primary"
          style={{ marginTop: theme.spacing.lg }}
        />
         {isSubmitting && <ActivityIndicator size="large" color={theme.colors.primary} style={{ marginTop: theme.spacing.md }} />}
      </ScrollView>
      
      {/* Modal de carregamento durante upload */}
      {uploadingPhoto && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={styles.loadingText}>Enviando imagem...</Text>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.white,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    paddingTop: 40, // Ajuste para Safe Area
  },
  backButton: {
    padding: theme.spacing.xs,
  },
  headerTitle: {
    fontSize: theme.typography.fontSizes.lg,
    fontWeight: theme.typography.fontWeights.bold,
    color: theme.colors.text,
  },
  scrollViewContent: {
    padding: theme.spacing.md,
    alignItems: 'center',
  },
  profilePictureContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
    position: 'relative',
  },
  profilePicture: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 4,
    borderColor: theme.colors.primary,
  },
  cameraIconOverlay: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    backgroundColor: theme.colors.primary,
    borderRadius: 20,
    padding: 8,
    borderWidth: 2,
    borderColor: theme.colors.white,
  },
  changePhotoText: {
    marginBottom: theme.spacing.xl,
    color: theme.colors.primary,
    fontWeight: theme.typography.fontWeights.semibold,
    fontSize: theme.typography.fontSizes.md,
  },
  inputGroup: {
    width: '100%',
    backgroundColor: theme.colors.white,
    borderRadius: theme.borders.radius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    ...theme.shadows.sm,
  },
  label: {
    fontSize: theme.typography.fontSizes.md,
    fontWeight: theme.typography.fontWeights.semibold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  input: {
    width: '100%',
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borders.radius.md,
    marginBottom: theme.spacing.md,
    backgroundColor: theme.colors.background,
    fontSize: theme.typography.fontSizes.md,
    color: theme.colors.text,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSizes.lg,
    fontWeight: theme.typography.fontWeights.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
    width: '100%',
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
    width: '90%',
    marginVertical: theme.spacing.md,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  loadingContainer: {
    backgroundColor: theme.colors.white,
    borderRadius: 8,
    padding: 20,
    alignItems: 'center',
    minWidth: 200,
    ...theme.shadows.lg,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: theme.colors.text,
    fontWeight: '500',
  }
});

export default EditProfileScreen;