// src/screens/ProfileScreen.js

import React, { useState, useEffect, useContext } from 'react';
import {
  View, Text, StyleSheet, ScrollView, ActivityIndicator,
  Alert, Button, Image, TouchableOpacity, FlatList
} from 'react-native';
import { AuthContext } from '../context/AuthContext';
import api, { getAPI_URL } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import theme from '../styles/theme';

const ProfileScreen = ({ navigation, route }) => {
  const { signOut, userData, updateUser } = useContext(AuthContext); // Usar dados do contexto
  const [user, setUser] = useState(userData); // Iniciar com dados do contexto
  const [myPosts, setMyPosts] = useState([]);
  const [favoritePosts, setFavoritePosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('myPosts');

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchProfileData();
    });
    return unsubscribe;
  }, [navigation]);

  const fetchProfileData = async () => {
    setLoading(true);
    try {
      const userToken = await AsyncStorage.getItem('userToken');
      if (!userToken) {
        Alert.alert('Erro', 'Token de autenticação não encontrado.');
        signOut();
        return;
      }

      // Busca os dados mais recentes do usuário
      const userResponse = await api.get('/users/me', {
        headers: { Authorization: `Bearer ${userToken}` }
      });
      
      // Atualiza o contexto e o estado local
      updateUser(userResponse.data);
      setUser(userResponse.data);

      const myPostsResponse = await api.get('/users/me/posts', {
        headers: { Authorization: `Bearer ${userToken}` }
      });
      setMyPosts(myPostsResponse.data);

      const favoritePostsResponse = await api.get('/users/me/favorites', {
        headers: { Authorization: `Bearer ${userToken}` }
      });
      setFavoritePosts(favoritePostsResponse.data);

    } catch (error) {
      console.error('Erro ao buscar dados do perfil:', error.response?.data || error.message);
      Alert.alert('Erro', error.response?.data?.message || 'Não foi possível carregar o perfil.');
      if (error.response?.status === 401 || error.response?.status === 403) {
        signOut();
      }
    } finally {
      setLoading(false);
    }
  };

  const renderPostItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.postCard} 
      onPress={() => navigation.navigate('PostDetail', { postId: item.id })}
    >
      <Text style={styles.postTitle}>{item.title}</Text>
      <Text style={styles.postContentPreview} numberOfLines={2}>{item.content}</Text>
      <View style={styles.postStatsRow}>
        <Text style={styles.postStatItem}>{item.likes_count || 0} Likes</Text>
        <Text style={styles.postStatItem}>{item.comments_count || 0} Comentários</Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Carregando perfil...</Text>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Perfil não encontrado.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={28} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Meu Perfil</Text>
        <TouchableOpacity onPress={() => navigation.navigate('EditProfile')} style={styles.editButton}>
          <Ionicons name="settings-outline" size={24} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        {/* Informações do Usuário */}
        <View style={styles.profileInfoCard}>
          {/* Garante que a URL da imagem esteja completa */}
          {user.profile_picture_url ? (
            <Image 
              source={{ uri: user.profile_picture_url }} 
              style={styles.profilePicture} 
              defaultSource={require('../../assets/favicon.png')}
            />
          ) : (
            <View style={styles.profilePicturePlaceholder}>
              <Ionicons name="person" size={60} color={theme.colors.primary} />
            </View>
          )}
          <Text style={styles.username}>{user.username}</Text>
          <Text style={styles.email}>{user.email}</Text>
          <Text style={styles.memberSince}>Membro desde: {new Date(user.created_at).toLocaleDateString('pt-BR')}</Text>
        </View>

        {/* Abas de Navegação */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'myPosts' && styles.activeTab]}
            onPress={() => setActiveTab('myPosts')}
          >
            <Text style={[styles.tabText, activeTab === 'myPosts' && styles.activeTabText]}>Meus Posts ({myPosts.length})</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'favorites' && styles.activeTab]}
            onPress={() => setActiveTab('favorites')}
          >
            <Text style={[styles.tabText, activeTab === 'favorites' && styles.activeTabText]}>Favoritos ({favoritePosts.length})</Text>
          </TouchableOpacity>
        </View>

        {/* Conteúdo da Aba Ativa */}
        {activeTab === 'myPosts' ? (
          myPosts.length > 0 ? (
            <FlatList
              data={myPosts}
              keyExtractor={(item) => item.id.toString()}
              renderItem={renderPostItem}
              scrollEnabled={false}
              contentContainerStyle={styles.postListContent}
            />
          ) : (
            <Text style={styles.noContentText}>Você ainda não fez nenhum post.</Text>
          )
        ) : (
          favoritePosts.length > 0 ? (
            <FlatList
              data={favoritePosts}
              keyExtractor={(item) => item.id.toString()}
              renderItem={renderPostItem}
              scrollEnabled={false}
              contentContainerStyle={styles.postListContent}
            />
          ) : (
            <Text style={styles.noContentText}>Você ainda não favoritou nenhum post.</Text>
          )
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    paddingTop: 40, // Ajuste para iOS
  },
  backButton: {
    padding: theme.spacing.xs,
  },
  headerTitle: {
    fontSize: theme.typography.fontSizes.lg,
    fontWeight: theme.typography.fontWeights.bold,
    color: theme.colors.text,
  },
  editButton: {
    padding: theme.spacing.xs,
  },
  scrollViewContent: {
    paddingBottom: theme.spacing.lg,
  },
  profileInfoCard: {
    backgroundColor: theme.colors.white,
    padding: theme.spacing.lg,
    margin: theme.spacing.md,
    borderRadius: theme.borders.radius.xl,
    alignItems: 'center',
    ...theme.shadows.lg,
  },
  profilePicture: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: theme.spacing.md,
    borderWidth: 3,
    borderColor: theme.colors.primary,
  },
  profilePicturePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: theme.spacing.md,
    backgroundColor: theme.colors.gray100,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: theme.colors.primaryLight,
  },
  username: {
    fontSize: theme.typography.fontSizes.xxl,
    fontWeight: theme.typography.fontWeights.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  email: {
    fontSize: theme.typography.fontSizes.md,
    color: theme.colors.textLight,
    marginBottom: theme.spacing.sm,
  },
  memberSince: {
    fontSize: theme.typography.fontSizes.sm,
    color: theme.colors.textMuted,
    backgroundColor: theme.colors.gray100,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borders.radius.pill,
  },
  tabsContainer: {
    flexDirection: 'row',
    marginHorizontal: theme.spacing.md,
    marginTop: theme.spacing.sm,
    backgroundColor: theme.colors.white,
    borderRadius: theme.borders.radius.lg,
    ...theme.shadows.sm,
  },
  tabButton: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: theme.colors.primary,
  },
  tabText: {
    fontSize: theme.typography.fontSizes.md,
    fontWeight: theme.typography.fontWeights.semibold,
    color: theme.colors.textLight,
  },
  activeTabText: {
    color: theme.colors.primary,
  },
  postListContent: {
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.sm,
  },
  postCard: {
    backgroundColor: theme.colors.white,
    padding: theme.spacing.md,
    borderRadius: theme.borders.radius.lg,
    marginBottom: theme.spacing.md,
    ...theme.shadows.md,
  },
  postTitle: {
    fontSize: theme.typography.fontSizes.lg,
    fontWeight: theme.typography.fontWeights.bold,
    marginBottom: theme.spacing.xs,
    color: theme.colors.text,
  },
  postContentPreview: {
    fontSize: theme.typography.fontSizes.md,
    color: theme.colors.textLight,
    marginBottom: theme.spacing.md,
  },
  postStatsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingTop: theme.spacing.sm,
  },
  postStatItem: {
    fontSize: theme.typography.fontSizes.sm,
    color: theme.colors.textMuted,
    marginRight: theme.spacing.md,
  },
  noContentText: {
    textAlign: 'center',
    marginTop: theme.spacing.xxl,
    fontSize: theme.typography.fontSizes.md,
    color: theme.colors.textMuted,
    marginHorizontal: theme.spacing.md,
  },
});

export default ProfileScreen;