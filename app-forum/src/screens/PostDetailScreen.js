import React, { useState, useEffect, useContext, useCallback } from 'react';
import {
  View, Text, StyleSheet, TextInput, ActivityIndicator, Alert, Image, TouchableOpacity, FlatList, RefreshControl, SafeAreaView, KeyboardAvoidingView, Platform
} from 'react-native';
import api, { getAPI_URL } from '../services/api';
import { AuthContext } from '../context/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import CommentItem from '../components/CommentItem';
import CustomButton from '../components/CustomButton';
import theme from '../styles/theme';

const PostDetailScreen = ({ route, navigation }) => {
  const { postId } = route.params;
  const { user, signOut } = useContext(AuthContext);
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [newCommentContent, setNewCommentContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const getFullUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    return `${getAPI_URL()}${url}`;
  };

  const fetchPostAndComments = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        signOut();
        return;
      }

      const [postResponse, commentsResponse] = await Promise.all([
        api.get(`/posts/${postId}`, { headers: { Authorization: `Bearer ${token}` } }),
        api.get(`/comments/${postId}`, { headers: { Authorization: `Bearer ${token}` } })
      ]);

      const fetchedPost = postResponse.data;
      fetchedPost.profile_picture_url = getFullUrl(fetchedPost.profile_picture_url);
      fetchedPost.image_url = getFullUrl(fetchedPost.image_url);
      setPost(fetchedPost);

      const fetchedComments = commentsResponse.data.map(comment => ({
        ...comment,
        profile_picture_url: getFullUrl(comment.profile_picture_url),
      }));
      setComments(fetchedComments);

    } catch (error) {
      console.error('Erro ao buscar detalhes do post/comentários:', error.response?.data || error.message);
      Alert.alert('Erro', 'Não foi possível carregar os detalhes do post.');
      navigation.goBack();
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [postId, navigation, signOut]);

  useEffect(() => {
    fetchPostAndComments();
  }, [fetchPostAndComments]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchPostAndComments();
  };

  const handleCreateComment = async () => {
    if (!newCommentContent.trim()) {
      Alert.alert('Erro', 'O comentário não pode ser vazio.');
      return;
    }
    setIsSubmittingComment(true);
    try {
      const userToken = await AsyncStorage.getItem('userToken');
      const response = await api.post(
        `/comments/${postId}`,
        { content: newCommentContent },
        { headers: { Authorization: `Bearer ${userToken}` } }
      );

      const newComment = {
        ...response.data.comment,
        profile_picture_url: getFullUrl(response.data.comment.profile_picture_url),
      };
      
      setComments(prevComments => [newComment, ...prevComments]);
      setPost(prevPost => ({ ...prevPost, comments_count: prevPost.comments_count + 1 }));
      setNewCommentContent('');
    } catch (error) {
      console.error('Erro ao criar comentário:', error.response?.data || error.message);
      Alert.alert('Erro ao Comentar', 'Ocorreu um erro ao adicionar o comentário.');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleCommentDeleted = (commentId) => {
    setComments(prevComments => prevComments.filter(comment => comment.id !== commentId));
    setPost(prevPost => ({ ...prevPost, comments_count: Math.max(0, prevPost.comments_count - 1) }));
  };

  const handleCommentUpdated = (updatedComment) => {
    const fullUrlUpdatedComment = {
        ...updatedComment,
        profile_picture_url: getFullUrl(updatedComment.profile_picture_url),
    };
    setComments(prevComments =>
      prevComments.map(comment =>
        comment.id === fullUrlUpdatedComment.id ? fullUrlUpdatedComment : comment
      )
    );
  };

  const renderHeader = () => (
    <View style={styles.postDetailCard}>
      <TouchableOpacity style={styles.postHeader} onPress={() => navigation.navigate('Profile', { userId: post.user_id })}>
        <Image 
          source={post.profile_picture_url ? { uri: post.profile_picture_url } : require('../../assets/icon.png')} 
          style={styles.profilePicture} 
        />
        <View>
          <Text style={styles.postUsername}>{post.username}</Text>
          <Text style={styles.postTimestamp}>{new Date(post.created_at).toLocaleDateString()}</Text>
        </View>
      </TouchableOpacity>
      <Text style={styles.postTitle}>{post.title}</Text>
      {post.image_url && (
        <Image source={{ uri: post.image_url }} style={styles.postImage} />
      )}
      <Text style={styles.postContent}>{post.content}</Text>
      <View style={styles.postStatsContainer}>
        <Text style={styles.postStats}>{post.likes_count || 0} Curtidas</Text>
        <Text style={styles.postStats}>{post.comments_count || 0} Comentários</Text>
      </View>
      <View style={styles.commentsTitleContainer}>
        <Text style={styles.commentsTitle}>Comentários</Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Carregando post...</Text>
      </View>
    );
  }

  if (!post) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={28} color={theme.colors.text} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Post não encontrado</Text>
            <View style={{ width: 28 }} />
        </View>
        <View style={styles.loadingContainer}>
            <Text>Este post não foi encontrado ou foi removido.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={28} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>{post.title}</Text>
          <View style={{ width: 28 }} />
        </View>

        <FlatList
          data={comments}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <CommentItem
              comment={item}
              currentUserId={user?.id}
              onCommentDeleted={handleCommentDeleted}
              onCommentUpdated={handleCommentUpdated}
            />
          )}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={
            <Text style={styles.noCommentsText}>
              Nenhum comentário ainda. Seja o primeiro!
            </Text>
          }
          contentContainerStyle={styles.listContentContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[theme.colors.primary]}
            />
          }
        />

        <View style={styles.addCommentContainer}>
          <TextInput
            style={styles.commentInput}
            placeholder="Adicione um comentário..."
            placeholderTextColor={theme.colors.textMuted}
            value={newCommentContent}
            onChangeText={setNewCommentContent}
            multiline
          />
          <CustomButton
            icon={<Ionicons name="send" size={18} color={theme.colors.white} />}
            onPress={handleCreateComment}
            disabled={isSubmittingComment}
            style={styles.commentButton}
            variant="primary"
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
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
  loadingText: {
      marginTop: theme.spacing.md,
      fontSize: theme.typography.fontSizes.md,
      color: theme.colors.textLight,
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
  },
  backButton: {
    padding: theme.spacing.xs,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: theme.typography.fontSizes.lg,
    fontWeight: theme.typography.fontWeights.bold,
    color: theme.colors.text,
    marginHorizontal: theme.spacing.sm,
  },
  listContentContainer: {
    paddingBottom: theme.spacing.md,
  },
  postDetailCard: {
    backgroundColor: theme.colors.white,
    paddingBottom: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  profilePicture: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: theme.spacing.md,
  },
  postUsername: {
    fontWeight: theme.typography.fontWeights.bold,
    fontSize: theme.typography.fontSizes.md,
    color: theme.colors.text,
  },
  postTimestamp: {
    fontSize: theme.typography.fontSizes.sm,
    color: theme.colors.textMuted,
  },
  postTitle: {
    fontSize: theme.typography.fontSizes.xl,
    fontWeight: theme.typography.fontWeights.bold,
    marginBottom: theme.spacing.md,
    color: theme.colors.text,
    paddingHorizontal: theme.spacing.md,
  },
  postImage: {
    width: '100%',
    height: 250,
    resizeMode: 'cover',
    marginBottom: theme.spacing.md,
  },
  postContent: {
    fontSize: theme.typography.fontSizes.md,
    lineHeight: 24,
    color: theme.colors.textLight,
    paddingHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  postStatsContainer: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  postStats: {
    fontSize: theme.typography.fontSizes.sm,
    color: theme.colors.textMuted,
    marginRight: theme.spacing.md,
  },
  commentsTitleContainer: {
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    backgroundColor: theme.colors.background,
  },
  commentsTitle: {
    fontSize: theme.typography.fontSizes.lg,
    fontWeight: theme.typography.fontWeights.bold,
    color: theme.colors.text,
  },
  noCommentsText: {
    textAlign: 'center',
    marginTop: theme.spacing.xxl,
    fontSize: theme.typography.fontSizes.md,
    color: theme.colors.textMuted,
  },
  addCommentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.white,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  commentInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borders.radius.pill,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.background,
    fontSize: theme.typography.fontSizes.md,
    maxHeight: 100,
    marginRight: theme.spacing.sm,
  },
  commentButton: {
    paddingHorizontal: theme.spacing.sm,
  }
});

export default PostDetailScreen;