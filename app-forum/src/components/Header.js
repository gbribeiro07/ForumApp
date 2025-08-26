import React, { useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  useWindowDimensions,
  Platform,
  StatusBar,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { AuthContext } from "../context/AuthContext";
import api, { getAPI_URL } from "../services/api";
import theme from "../styles/theme";

const Header = ({
  title,
  showBackButton = false,
  showLogout = false,
  rightComponent = null,
  user = null,
}) => {
  const navigation = useNavigation();
  const { signOut } = useContext(AuthContext);
  const { width } = useWindowDimensions();

  const isMobile = width < 768;

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };

  return (
    <View
      style={[
        styles.header,
        // Ajusta estilo para web vs mobile
        Platform.OS === "web" && !isMobile && styles.headerWeb,
      ]}
    >
      <View style={styles.headerLeft}>
        {showBackButton && (
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
        )}

        <Text style={styles.title}>{title}</Text>
      </View>

      <View style={styles.headerRight}>
        {user && (
          <TouchableOpacity
            style={styles.userInfo}
            onPress={() => navigation.navigate("Profile", { userId: user.id })}
          >
            {user.profile_picture_url || user.profilePictureUrl ? (
              <Image
                source={{
                  uri: user.profile_picture_url
                    ? user.profile_picture_url.startsWith("http")
                      ? user.profile_picture_url
                      : `${getAPI_URL()}${user.profile_picture_url}`
                    : user.profilePictureUrl,
                }}
                defaultSource={require("../../assets/favicon.png")}
                style={styles.userAvatar}
              />
            ) : (
              <View style={styles.userInitials}>
                <Text style={styles.initialsText}>
                  {user && user.username
                    ? user.username.charAt(0).toUpperCase()
                    : "U"}
                </Text>
              </View>
            )}
            <Text style={styles.username}>
              {user && user.username
                ? isMobile
                  ? `@${user.username.slice(0, 8)}...`
                  : `@${user.username}`
                : "@usuário"}
            </Text>
          </TouchableOpacity>
        )}

        {rightComponent}

        {showLogout && (
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={22} color="#ff4d4d" />
            {!isMobile && <Text style={styles.logoutText}>Sair</Text>}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.white,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    paddingTop:
      Platform.OS === "android"
        ? StatusBar.currentHeight + theme.spacing.sm
        : theme.spacing.sm,
    ...theme.shadows.sm,
    zIndex: theme.utils.zIndex.sticky,
  },
  headerWeb: {
    paddingHorizontal: theme.spacing.lg,
    height: 64,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: {
    marginRight: theme.spacing.sm,
    padding: theme.spacing.xs,
    borderRadius: theme.borders.radius.sm,
    backgroundColor: theme.colors.gray100,
  },
  title: {
    fontSize: theme.typography.fontSizes.lg,
    fontWeight: theme.typography.fontWeights.bold,
    color: theme.colors.text,
    letterSpacing: theme.typography.letterSpacing.tight,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
    borderRadius: theme.borders.radius.pill,
    backgroundColor: theme.colors.gray100,
  },
  userAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: theme.spacing.xs,
    borderWidth: 2,
    borderColor: theme.colors.white,
  },
  userInitials: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginRight: theme.spacing.xs,
  },
  initialsText: {
    color: theme.colors.white,
    fontWeight: theme.typography.fontWeights.bold,
    fontSize: theme.typography.fontSizes.sm,
  },
  username: {
    fontSize: theme.typography.fontSizes.sm,
    fontWeight: theme.typography.fontWeights.medium,
    color: theme.colors.textLight,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
    borderRadius: theme.borders.radius.pill,
    backgroundColor: theme.colors.gray100,
  },
  logoutText: {
    marginLeft: theme.spacing.xs,
    fontSize: theme.typography.fontSizes.sm,
    color: theme.colors.danger,
    fontWeight: theme.typography.fontWeights.medium,
  },
});

export default Header;
