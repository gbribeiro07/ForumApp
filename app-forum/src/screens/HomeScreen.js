// src/screens/HomeScreen.js

import React, { useState, useEffect, useContext, useCallback } from 'react';
import {
  View, Text, StyleSheet, Alert,
  FlatList, TextInput, TouchableOpacity, ActivityIndicator, Image,
  Dimensions, RefreshControl, SafeAreaView, StatusBar, KeyboardAvoidingView, Platform
} from 'react-native';
import { AuthContext } from '../context/AuthContext';
import api, { getAPI_URL } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

// Componentes personalizados
import PostCard from '../components/PostCard';
import CustomButton from '../components/CustomButton';
import Header from '../components/Header';
import theme from '../styles/theme';

const HomeScreen = ({ navigation }) => {
  const { signOut, userToken, userData, updateUser } = useContext(AuthContext);
  const [posts, setPosts] = useState([]);
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [userLikes, setUserLikes] = useState({});
  const [userFavorites, setUserFavorites] = useState({});
  const [newPostImageUri, setNewPostImageUri] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMorePosts, setHasMorePosts] = useState(true);
  const [showNewPostForm, setShowNewPostForm] = useState(false);
  
  const getFullUrl = (url) => {
    if (!url || url.startsWith('http')) return url;
    return `${getAPI_URL()}${url}`;
  };

  const fetchPosts = useCallback(async (pageToLoad = 1, resetList = false) => {
    if (loadingPosts && !resetList) return; // Evita buscas múltiplas
    if (resetList) {
      setLoadingPosts(true);
      setHasMorePosts(true);
      setPage(1);
    }

    try {
      const response = await api.get(`/posts?q=${searchTerm}&page=${pageToLoad}&limit=10`, {
        headers: { Authorization: `Bearer ${userToken}` }
      });
      
      if (response.data.length === 0) {
        setHasMorePosts(false);
        if (resetList) setPosts([]);
        return;
      }
      
      const processedPosts = response.data.map(post => ({
        ...post,
        profile_picture_url: getFullUrl(post.profile_picture_url),
        image_url: getFullUrl(post.image_url),
      }));

      setPosts(prevPosts => resetList ? processedPosts : [...prevPosts, ...processedPosts]);
      setPage(pageToLoad + 1);
      
    } catch (error) {
      console.error('Erro ao buscar posts:', error.response?.data || error.message);
      if (resetList) setPosts([]);
    } finally {
      setLoadingPosts(false);
      setRefreshing(false);
    }
  }, [searchTerm, userToken, loadingPosts]);

  useEffect(() => {
    fetchPosts(1, true);
  }, [searchTerm]); // Apenas re-fetch no search
  
  useEffect(() => {
    // Busca likes e favoritos quando o usuário é carregado
    const fetchUserInteractions = async () => {
        if (userData?.id && userToken) {
            try {
                const [likesResponse, favoritesResponse] = await Promise.all([
                    api.get(`/users/${userData.id}/likes`, { headers: { Authorization: `Bearer ${userToken}` } }),
                    api.get(`/users/${userData.id}/favorites`, { headers: { Authorization: `Bearer ${userToken}` } })
                ]);
                
                const newUserLikes = {};
                likesResponse.data.forEach(like => { newUserLikes[like.post_id] = true; });
                setUserLikes(newUserLikes);

                const newUserFavorites = {};
                favoritesResponse.data.forEach(fav => { newUserFavorites[fav.post_id] = true; });
                setUserFavorites(newUserFavorites);
            } catch (error) {
                console.warn('Erro ao buscar interações do usuário:', error.message);
            }
        }
    };
    fetchUserInteractions();
  }, [userData, userToken]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchPosts(1, true);
  }, []);
  
  const loadMorePosts = () => {
    if (!loadingPosts && hasMorePosts) {
      fetchPosts(page);
    }
  };
  
  const pickPostImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão Negada', 'Desculpe, precisamos de permissões de galeria para isso funcionar!');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setNewPostImageUri(result.assets[0].uri);
    }
  };

  const handleCreatePost = async () => {
    if (!newPostTitle.trim() || !newPostContent.trim()) {
      Alert.alert('Erro', 'Título e conteúdo do post não podem ser vazios.');
      return;
    }

    setIsSubmitting(true);
    try {
      let imageUrlToSave = null;
      if (newPostImageUri) {
        const formData = new FormData();
        formData.append('postImage', {
          uri: newPostImageUri,
          name: `post_${userData.id}_${Date.now()}.jpg`,
          type: 'image/jpeg',
        });

        const uploadResponse = await api.post('/upload/post-image', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${userToken}`,
          },
        });
        imageUrlToSave = uploadResponse.data.imageUrl;
      }

      const response = await api.post(
        '/posts',
        { title: newPostTitle, content: newPostContent, image_url: imageUrlToSave },
        { headers: { 'Authorization': `Bearer ${userToken}` } }
      );
      
      setNewPostTitle('');
      setNewPostContent('');
      setNewPostImageUri(null);
      setShowNewPostForm(false);
      
      onRefresh(); // Recarrega a lista de posts
      
      Alert.alert('Sucesso', 'Post criado com sucesso!');
    } catch (error) {
      console.error('Erro ao criar post:', error.response?.data || error.message);
      Alert.alert('Erro ao Criar Post', error.response?.data?.message || 'Ocorreu um erro inesperado.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleLike = (postId, isLiked) => {
    setUserLikes(prev => ({ ...prev, [postId]: isLiked }));
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, likes_count: p.likes_count + (isLiked ? 1 : -1) } : p));
  };

  const handleToggleFavorite = (postId, isFavorited) => {
    setUserFavorites(prev => ({ ...prev, [postId]: isFavorited }));
  };
  
  const handleDeletePost = (postId) => {
    setPosts(prev => prev.filter(p => p.id !== postId));
  };

  const renderPostItem = ({ item }) => (
    <PostCard
      post={{
        ...item,
        liked: !!userLikes[item.id],
        favorited: !!userFavorites[item.id]
      }}
      onLike={handleToggleLike}
      onFavorite={handleToggleFavorite}
      onDelete={handleDeletePost}
      userId={userData?.id}
    />
  );

  const renderFooter = () => {
    if (!loadingPosts || page === 1) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={theme.colors.primary} />
      </View>
    );
  };

  const renderEmptyList = () => (
    !loadingPosts && (
      <View style={styles.emptyContainer}>
        <Ionicons name="chatbubbles-outline" size={70} color={theme.colors.gray400} />
        <Text style={styles.emptyTitle}>Nenhum post encontrado</Text>
        <Text style={styles.emptySubtitle}>
          {searchTerm 
            ? "Tente ajustar sua pesquisa." 
            : "Seja o primeiro a criar um post!"}
        </Text>
        <CustomButton 
          title="Criar Novo Post" 
          variant="primary"
          onPress={() => setShowNewPostForm(true)}
          style={styles.emptyButton}
        />
      </View>
    )
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.white} />
      <Header 
        title="DevSocial"
        user={userData}
        showLogout={true}
        rightComponent={
          <TouchableOpacity 
            style={styles.newPostButton}
            onPress={() => setShowNewPostForm(!showNewPostForm)}
          >
            <Ionicons 
              name={showNewPostForm ? "close" : "add"} 
              size={32} 
              color={theme.colors.primary} 
            />
          </TouchableOpacity>
        }
      />

      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <FlatList
          data={posts}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderPostItem}
          contentContainerStyle={[
            styles.postList,
            posts.length === 0 && styles.emptyList
          ]}
          ListHeaderComponent={
            <>
              <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} color={theme.colors.textMuted} style={styles.searchIcon} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Pesquisar posts..."
                  placeholderTextColor={theme.colors.textMuted}
                  value={searchTerm}
                  onChangeText={setSearchTerm}
                  returnKeyType="search"
                  onSubmitEditing={() => fetchPosts(1, true)}
                />
                {searchTerm ? (
                  <TouchableOpacity onPress={() => setSearchTerm('')} style={styles.clearButton}>
                    <Ionicons name="close-circle" size={20} color={theme.colors.textMuted} />
                  </TouchableOpacity>
                ) : null}
              </View>

              {showNewPostForm && (
                <View style={styles.createPostContainer}>
                  <Text style={styles.formTitle}>Criar Publicação</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Título"
                    placeholderTextColor={theme.colors.textMuted}
                    value={newPostTitle}
                    onChangeText={setNewPostTitle}
                  />
                  <TextInput
                    style={[styles.input, styles.contentInput]}
                    placeholder="O que você está pensando?"
                    placeholderTextColor={theme.colors.textMuted}
                    value={newPostContent}
                    onChangeText={setNewPostContent}
                    multiline
                  />
                  
                  <View style={styles.imagePickerRow}>
                    <CustomButton
                      title={newPostImageUri ? "Trocar Imagem" : "Adicionar Imagem"}
                      variant="outline"
                      onPress={pickPostImage}
                      style={styles.imagePickerButton}
                    />
                    {newPostImageUri && (
                      <TouchableOpacity onPress={() => setNewPostImageUri(null)} style={styles.removeImageButton}>
                        <Ionicons name="trash-outline" size={24} color={theme.colors.danger} />
                      </TouchableOpacity>
                    )}
                  </View>
                  
                  {newPostImageUri && (
                    <Image source={{ uri: newPostImageUri }} style={styles.previewImage} />
                  )}
                  
                  <CustomButton
                    title={isSubmitting ? "Publicando..." : "Publicar"}
                    variant="primary"
                    onPress={handleCreatePost}
                    disabled={isSubmitting || !newPostTitle.trim() || !newPostContent.trim()}
                    loading={isSubmitting}
                    style={{ marginTop: theme.spacing.md }}
                  />
                </View>
              )}
            </>
          }
          ListEmptyComponent={renderEmptyList}
          ListFooterComponent={renderFooter}
          onEndReached={loadMorePosts}
          onEndReachedThreshold={0.5}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={onRefresh}
              colors={[theme.colors.primary]}
              tintColor={theme.colors.primary}
            />
          }
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.white,
    borderRadius: theme.borders.radius.md,
    marginHorizontal: theme.spacing.md,
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  searchIcon: {
    marginRight: theme.spacing.sm,
  },
  searchInput: {
    flex: 1,
    height: 44,
    fontSize: theme.typography.fontSizes.md,
    color: theme.colors.text,
  },
  clearButton: {
    padding: theme.spacing.xs,
  },
  createPostContainer: {
    backgroundColor: theme.colors.white,
    marginHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.md,
    borderRadius: theme.borders.radius.lg,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  formTitle: {
    fontSize: theme.typography.fontSizes.lg,
    fontWeight: theme.typography.fontWeights.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borders.radius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    marginBottom: theme.spacing.md,
    backgroundColor: theme.colors.background,
    fontSize: theme.typography.fontSizes.md,
    color: theme.colors.text,
  },
  contentInput: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  imagePickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
  },
  imagePickerButton: {
    flex: 1,
  },
  removeImageButton: {
    marginLeft: theme.spacing.md,
    padding: theme.spacing.xs,
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: theme.borders.radius.lg,
    marginBottom: theme.spacing.md,
  },
  postList: {
    paddingHorizontal: theme.spacing.md,
  },
  emptyList: {
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.lg,
  },
  emptyTitle: {
    fontSize: theme.typography.fontSizes.xl,
    fontWeight: theme.typography.fontWeights.bold,
    color: theme.colors.text,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  emptySubtitle: {
    fontSize: theme.typography.fontSizes.md,
    color: theme.colors.textLight,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  emptyButton: {
    minWidth: 200,
  },
  footerLoader: {
    paddingVertical: theme.spacing.lg,
  },
  newPostButton: {
    padding: theme.spacing.sm,
  },
});

export default HomeScreen;