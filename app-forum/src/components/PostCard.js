import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Dimensions,
  Animated,
  Pressable,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import api from "../services/api";
import theme from "../styles/theme";

const { width: screenWidth } = Dimensions.get("window");

const isValidImageUrl = (url) => {
  if (!url || typeof url !== "string" || url.trim() === "") return false;

  try {
    const parsedUrl = new URL(url);

    if (!["http:", "https:"].includes(parsedUrl.protocol)) {
      return false;
    }

    if (!parsedUrl.hostname || parsedUrl.hostname.length < 3) {
      return false;
    }
    return true;
  } catch {
    return url.startsWith("/uploads") && url.length > 8;
  }
};

const PostCard = ({
  post,
  onLike,
  onFavorite,
  showActions = true,
  refreshPosts,
  userToken,
  userId,
}) => {
  const navigation = useNavigation();
  const [isLiking, setIsLiking] = useState(false);
  const [isFavoriting, setIsFavoriting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  const [postData, setPostData] = useState(post);

  const isOwnPost = postData.user_id === userId;

  const formatDate = (dateString) => {
    const options = {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString("pt-BR", options);
  };

  const handleLike = async () => {
    try {
      setIsLiking(true);
      const response = await api.post(
        `/posts/${postData.id}/like`,
        {},
        {
          headers: { Authorization: `Bearer ${userToken}` },
        }
      );

      setPostData({
        ...postData,
        liked: !postData.liked,
        likes_count: postData.liked
          ? postData.likes_count - 1
          : postData.likes_count + 1,
      });

      if (onLike) onLike(postData.id, !postData.liked);
    } catch (error) {
      Alert.alert("Erro", "Não foi possível curtir este post.");
    } finally {
      setIsLiking(false);
    }
  };

  const handleFavorite = async () => {
    try {
      setIsFavoriting(true);
      const response = await api.post(
        `/posts/${postData.id}/favorite`,
        {},
        {
          headers: { Authorization: `Bearer ${userToken}` },
        }
      );

      setPostData({
        ...postData,
        favorited: !postData.favorited,
      });

      if (onFavorite) onFavorite(postData.id, !postData.favorited);
    } catch (error) {
      Alert.alert("Erro", "Não foi possível favoritar este post.");
    } finally {
      setIsFavoriting(false);
    }
  };

  const handleDeletePost = async () => {
    Alert.alert("Excluir Post", "Tem certeza que deseja excluir este post?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Excluir",
        style: "destructive",
        onPress: async () => {
          try {
            setIsDeleting(true);
            await api.delete(`/posts/${postData.id}`, {
              headers: { Authorization: `Bearer ${userToken}` },
            });

            Alert.alert("Sucesso", "Post excluído com sucesso!");

            if (refreshPosts) refreshPosts();
          } catch (error) {
            Alert.alert("Erro", "Não foi possível excluir este post.");
          } finally {
            setIsDeleting(false);
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.card}>
      {/* Cabeçalho do Card - Autor e Data */}
      <View style={styles.cardHeader}>
        <TouchableOpacity
          style={styles.author}
          onPress={() =>
            navigation.navigate("Profile", { userId: postData.user_id })
          }
        >
          <Image
            source={
              postData.profile_picture_url
                ? { uri: postData.profile_picture_url }
                : require("../../assets/favicon.png")
            }
            style={styles.authorAvatar}
          />
          <Text style={styles.authorName}>
            {postData.username || "Usuário"}
          </Text>
        </TouchableOpacity>
        <Text style={styles.date}>{formatDate(postData.created_at)}</Text>
      </View>

      <TouchableOpacity
        style={styles.cardBody}
        onPress={() => {
          try {
            navigation.navigate("PostDetail", { postId: postData.id });
          } catch (error) {
            console.error("Erro ao navegar para PostDetail:", error);
            Alert.alert("Erro", "Não foi possível abrir os detalhes do post.");
          }
        }}
      >
        <Text style={styles.postTitle}>{postData.title}</Text>
        <Text style={styles.postContent} numberOfLines={3}>
          {postData.content}
        </Text>
      </TouchableOpacity>

      {postData.image_url && isValidImageUrl(postData.image_url) && (
        <View style={styles.imageContainer}>
          {imageLoading && (
            <View style={styles.imagePlaceholder}>
              <ActivityIndicator size="large" color="#007AFF" />
              <Text style={styles.loadingText}>Carregando imagem...</Text>
            </View>
          )}
          {imageError && (
            <View style={styles.imageErrorContainer}>
              <Ionicons name="image-outline" size={50} color="#999" />
              <Text style={styles.errorText}>Erro ao carregar imagem</Text>
              <Text style={styles.urlText} numberOfLines={1}>
                {postData.image_url}
              </Text>
            </View>
          )}
          {!imageError && (
            <TouchableOpacity
              onPress={() => {
                try {
                  navigation.navigate("PostDetail", { postId: postData.id });
                } catch (error) {
                  console.error("Erro ao navegar via imagem:", error);
                  Alert.alert(
                    "Erro",
                    "Não foi possível abrir os detalhes do post."
                  );
                }
              }}
              activeOpacity={0.9}
            >
              <Image
                source={{ uri: postData.image_url }}
                style={[styles.postImage, imageLoading && styles.hiddenImage]}
                resizeMode="cover"
                onLoad={() => {
                  setImageLoading(false);
                  setImageError(false);
                }}
                onError={(e) => {
                  console.warn(
                    "Erro ao carregar imagem:",
                    e.nativeEvent.error,
                    postData.image_url
                  );
                  setImageLoading(false);
                  setImageError(true);
                }}
              />
            </TouchableOpacity>
          )}
        </View>
      )}

      {showActions && (
        <View style={styles.cardFooter}>
          <TouchableOpacity
            style={styles.action}
            onPress={handleLike}
            disabled={isLiking}
          >
            {isLiking ? (
              <ActivityIndicator size="small" color="#0066cc" />
            ) : (
              <Ionicons
                name={postData.liked ? "heart" : "heart-outline"}
                size={20}
                color={postData.liked ? "#e91e63" : "#666"}
              />
            )}
            <Text style={styles.actionText}>
              {postData.likes_count || 0}{" "}
              {postData.likes_count === 1 ? "Curtida" : "Curtidas"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.action}
            onPress={() =>
              navigation.navigate("PostDetail", { postId: postData.id })
            }
          >
            <Ionicons name="chatbubble-outline" size={18} color="#666" />
            <Text style={styles.actionText}>
              {postData.comments_count || 0}{" "}
              {postData.comments_count === 1 ? "Comentário" : "Comentários"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.action}
            onPress={handleFavorite}
            disabled={isFavoriting}
          >
            {isFavoriting ? (
              <ActivityIndicator size="small" color="#0066cc" />
            ) : (
              <Ionicons
                name={postData.favorited ? "bookmark" : "bookmark-outline"}
                size={18}
                color={postData.favorited ? "#ffc107" : "#666"}
              />
            )}
          </TouchableOpacity>

          {isOwnPost && (
            <TouchableOpacity
              style={styles.action}
              onPress={handleDeletePost}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <ActivityIndicator size="small" color="#ff0000" />
              ) : (
                <Ionicons name="trash-outline" size={18} color="#ff0000" />
              )}
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borders.radius.lg,
    marginBottom: theme.spacing.lg,
    marginHorizontal: theme.spacing.sm,
    ...theme.shadows.md,
    width: screenWidth - 16,
    alignSelf: "center",
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
  },
  author: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  authorAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: theme.spacing.sm,
    backgroundColor: theme.colors.gray100,
    borderWidth: 2,
    borderColor: theme.colors.primaryLight,
  },
  authorName: {
    fontWeight: theme.typography.fontWeights.semibold,
    color: theme.colors.text,
    fontSize: theme.typography.fontSizes.md,
    flex: 1,
  },
  date: {
    color: theme.colors.textLight,
    fontSize: theme.typography.fontSizes.xs,
    fontWeight: theme.typography.fontWeights.regular,
    backgroundColor: theme.colors.gray100,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xxs,
    borderRadius: theme.borders.radius.pill,
  },
  cardBody: {
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.md,
  },
  postTitle: {
    fontSize: theme.typography.fontSizes.xl,
    fontWeight: theme.typography.fontWeights.bold,
    marginBottom: theme.spacing.sm,
    color: theme.colors.text,
    lineHeight: 28,
  },
  postContent: {
    fontSize: theme.typography.fontSizes.md,
    color: theme.colors.textLight,
    lineHeight: 24,
    marginBottom: theme.spacing.sm,
  },
  imageContainer: {
    width: "100%",
    marginTop: theme.spacing.sm,
    borderRadius: theme.borders.radius.md,
    overflow: "hidden",
    backgroundColor: theme.colors.gray100,
    position: "relative",
  },
  postImage: {
    width: "100%",
    height: 240,
    borderRadius: theme.borders.radius.md,
  },
  hiddenImage: {
    position: "absolute",
    opacity: 0,
  },
  imagePlaceholder: {
    width: "100%",
    height: 240,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.colors.gray100,
  },
  loadingText: {
    marginTop: theme.spacing.sm,
    color: theme.colors.textLight,
    fontSize: theme.typography.fontSizes.sm,
  },
  imageErrorContainer: {
    width: "100%",
    height: 240,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.colors.gray100,
    padding: theme.spacing.lg,
  },
  errorText: {
    marginTop: theme.spacing.sm,
    color: theme.colors.textMuted,
    fontSize: theme.typography.fontSizes.sm,
    textAlign: "center",
  },
  urlText: {
    marginTop: theme.spacing.xs,
    color: theme.colors.gray400,
    fontSize: theme.typography.fontSizes.xs,
    textAlign: "center",
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.borderLight,
    backgroundColor: theme.colors.gray100,
    borderBottomLeftRadius: theme.borders.radius.lg,
    borderBottomRightRadius: theme.borders.radius.lg,
  },
  action: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
    borderRadius: theme.borders.radius.pill,
    backgroundColor: theme.colors.white,
    ...theme.shadows.xs,
    marginHorizontal: theme.spacing.xxs,
  },
  actionText: {
    marginLeft: theme.spacing.xs,
    fontSize: theme.typography.fontSizes.xs,
    color: theme.colors.textLight,
    fontWeight: theme.typography.fontWeights.medium,
  },
});

export default PostCard;
