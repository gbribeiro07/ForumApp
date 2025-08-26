import React, { useState, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import api from "../services/api";
import theme from "../styles/theme";
import { AuthContext } from "../context/AuthContext";

const CommentItem = ({
  comment,
  currentUserId,
  onCommentDeleted,
  onCommentUpdated,
}) => {
  const navigation = useNavigation();
  const { userToken } = useContext(AuthContext);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(comment.content);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const isOwnComment = comment.user_id === currentUserId;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffSeconds = Math.round((now - date) / 1000);

    if (diffSeconds < 60) return `${diffSeconds}s ago`;
    const diffMinutes = Math.round(diffSeconds / 60);
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    const diffHours = Math.round(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.round(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const handleDelete = () => {
    Alert.alert(
      "Excluir Comentário",
      "Tem certeza que deseja excluir este comentário?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: async () => {
            setIsDeleting(true);
            try {
              await api.delete(`/comments/${comment.id}`, {
                headers: { Authorization: `Bearer ${userToken}` },
              });
              onCommentDeleted?.(comment.id);
            } catch (error) {
              console.error(
                "Erro ao excluir comentário:",
                error.response?.data || error.message
              );
              Alert.alert("Erro", "Não foi possível excluir o comentário.");
            } finally {
              setIsDeleting(false);
            }
          },
        },
      ]
    );
  };

  const handleUpdate = async () => {
    if (!editedContent.trim()) {
      Alert.alert("Erro", "O comentário não pode estar vazio.");
      return;
    }
    if (editedContent.trim() === comment.content) {
      setIsEditing(false);
      return;
    }

    setIsSaving(true);
    try {
      const response = await api.put(
        `/comments/${comment.id}`,
        { content: editedContent.trim() },
        { headers: { Authorization: `Bearer ${userToken}` } }
      );
      onCommentUpdated?.(response.data.comment);
      setIsEditing(false);
    } catch (error) {
      console.error(
        "Erro ao atualizar comentário:",
        error.response?.data || error.message
      );
      Alert.alert("Erro", "Não foi possível atualizar o comentário.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View style={styles.commentContainer}>
      <TouchableOpacity
        onPress={() =>
          navigation.navigate("Profile", { userId: comment.user_id })
        }
      >
        <Image
          source={
            comment.profile_picture_url
              ? { uri: comment.profile_picture_url }
              : require("../../assets/icon.png")
          }
          style={styles.avatar}
        />
      </TouchableOpacity>

      <View style={styles.commentContent}>
        <View style={styles.commentHeader}>
          <TouchableOpacity
            onPress={() =>
              navigation.navigate("Profile", { userId: comment.user_id })
            }
          >
            <Text style={styles.username}>{comment.username}</Text>
          </TouchableOpacity>
          <Text style={styles.date}>{formatDate(comment.created_at)}</Text>
        </View>

        {isEditing ? (
          <TextInput
            style={styles.editInput}
            value={editedContent}
            onChangeText={setEditedContent}
            multiline
            autoFocus
          />
        ) : (
          <Text style={styles.commentText}>{comment.content}</Text>
        )}

        {isOwnComment && (
          <View style={styles.actions}>
            {isEditing ? (
              <>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={handleUpdate}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <ActivityIndicator
                      size="small"
                      color={theme.colors.primary}
                    />
                  ) : (
                    <Text
                      style={[
                        styles.actionText,
                        { color: theme.colors.primary },
                      ]}
                    >
                      Salvar
                    </Text>
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => {
                    setIsEditing(false);
                    setEditedContent(comment.content);
                  }}
                  disabled={isSaving}
                >
                  <Text style={styles.actionText}>Cancelar</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => setIsEditing(true)}
                >
                  <Text style={styles.actionText}>Editar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={handleDelete}
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <ActivityIndicator
                      size="small"
                      color={theme.colors.danger}
                    />
                  ) : (
                    <Text
                      style={[
                        styles.actionText,
                        { color: theme.colors.danger },
                      ]}
                    >
                      Excluir
                    </Text>
                  )}
                </TouchableOpacity>
              </>
            )}
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  commentContainer: {
    flexDirection: "row",
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    backgroundColor: theme.colors.white,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: theme.spacing.md,
    backgroundColor: theme.colors.gray100,
  },
  commentContent: {
    flex: 1,
  },
  commentHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: theme.spacing.xs,
  },
  username: {
    fontWeight: theme.typography.fontWeights.bold,
    fontSize: theme.typography.fontSizes.md,
    color: theme.colors.text,
    marginRight: theme.spacing.sm,
  },
  date: {
    fontSize: theme.typography.fontSizes.sm,
    color: theme.colors.textMuted,
  },
  commentText: {
    fontSize: theme.typography.fontSizes.md,
    color: theme.colors.textLight,
    lineHeight: 22,
  },
  actions: {
    flexDirection: "row",
    marginTop: theme.spacing.sm,
  },
  actionButton: {
    paddingVertical: theme.spacing.xs,
    marginRight: theme.spacing.md,
  },
  actionText: {
    fontSize: theme.typography.fontSizes.sm,
    color: theme.colors.textMuted,
    fontWeight: theme.typography.fontWeights.semibold,
  },
  editInput: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borders.radius.md,
    padding: theme.spacing.sm,
    fontSize: theme.typography.fontSizes.md,
    backgroundColor: theme.colors.background,
    marginTop: theme.spacing.xs,
    marginBottom: theme.spacing.xs,
    color: theme.colors.text,
  },
});

export default CommentItem;
