// src/components/CustomButton.js

import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  View,
  Animated,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import theme from "../styles/theme";

const CustomButton = ({
  title,
  onPress,
  type = "primary",
  size = "medium",
  loading = false,
  disabled = false,
  icon = null,
  iconPosition = "left",
  style = {},
  textStyle = {},
  fullWidth = false,
  rounded = false,
}) => {
  const animatedValue = React.useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(animatedValue, {
      toValue: 0.96,
      friction: 4,
      tension: 300,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(animatedValue, {
      toValue: 1,
      friction: 4,
      tension: 300,
      useNativeDriver: true,
    }).start();
  };

  const getButtonStyle = () => {
    switch (type) {
      case "secondary":
        return styles.buttonSecondary;
      case "danger":
        return styles.buttonDanger;
      case "outline":
        return styles.buttonOutline;
      case "text":
        return styles.buttonText;
      case "success":
        return styles.buttonSuccess;
      case "warning":
        return styles.buttonWarning;
      case "info":
        return styles.buttonInfo;
      default:
        return styles.buttonPrimary;
    }
  };

  const getSizeStyle = () => {
    switch (size) {
      case "small":
        return styles.buttonSmall;
      case "large":
        return styles.buttonLarge;
      default:
        return styles.buttonMedium;
    }
  };

  const getTextStyle = () => {
    switch (type) {
      case "secondary":
        return styles.textSecondary;
      case "danger":
        return styles.textDanger;
      case "outline":
        return styles.textOutline;
      case "text":
        return styles.textPlain;
      case "success":
        return styles.textSuccess;
      case "warning":
        return styles.textWarning;
      case "info":
        return styles.textInfo;
      default:
        return styles.textPrimary;
    }
  };

  const getTextSizeStyle = () => {
    switch (size) {
      case "small":
        return styles.textSmall;
      case "large":
        return styles.textLarge;
      default:
        return styles.textMedium;
    }
  };

  const getSpinnerColor = () => {
    if (type === "outline" || type === "secondary" || type === "text") {
      return theme.colors.primary;
    }
    return theme.colors.white;
  };

  const getIconColor = () => {
    if (type === "outline" || type === "secondary" || type === "text") {
      return theme.colors.primary;
    } else if (type === "danger") {
      return theme.colors.white;
    } else if (type === "success") {
      return theme.colors.white;
    } else if (type === "warning") {
      return theme.colors.white;
    } else if (type === "info") {
      return theme.colors.white;
    }
    return theme.colors.white;
  };

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={loading || disabled}
      style={({ pressed }) => [{ opacity: pressed ? 0.9 : 1 }]}
    >
      <Animated.View
        style={[
          styles.button,
          getButtonStyle(),
          getSizeStyle(),
          fullWidth && styles.fullWidth,
          disabled && styles.buttonDisabled,
          rounded && styles.buttonRounded,
          { transform: [{ scale: animatedValue }] },
          style,
        ]}
      >
        {loading ? (
          <ActivityIndicator
            color={getSpinnerColor()}
            size={size === "small" ? "small" : "small"}
          />
        ) : (
          <View
            style={[
              styles.buttonContent,
              iconPosition === "right" && { flexDirection: "row-reverse" },
            ]}
          >
            {icon && (
              <Ionicons
                name={icon}
                size={size === "small" ? 16 : size === "large" ? 22 : 18}
                color={getIconColor()}
                style={
                  iconPosition === "right" ? styles.iconRight : styles.iconLeft
                }
              />
            )}
            {typeof title === "string" && (
              <Text
                style={[
                  styles.buttonLabel,
                  getTextStyle(),
                  getTextSizeStyle(),
                  disabled && styles.textDisabled,
                  textStyle,
                ]}
              >
                {title}
              </Text>
            )}
          </View>
        )}
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: theme.borders.radius.md,
    overflow: "hidden",
  },
  fullWidth: {
    width: "100%",
  },
  buttonSmall: {
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.md,
    minHeight: 36,
  },
  buttonMedium: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    minHeight: 48,
  },
  buttonLarge: {
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.xl,
    minHeight: 56,
  },
  buttonRounded: {
    borderRadius: theme.borders.radius.pill,
  },
  buttonPrimary: {
    backgroundColor: theme.colors.primary,
    ...theme.shadows.sm,
  },
  buttonSecondary: {
    backgroundColor: theme.colors.primaryLight,
  },
  buttonDanger: {
    backgroundColor: theme.colors.danger,
    ...theme.shadows.sm,
  },
  buttonSuccess: {
    backgroundColor: theme.colors.success,
    ...theme.shadows.sm,
  },
  buttonWarning: {
    backgroundColor: theme.colors.warning,
    ...theme.shadows.sm,
  },
  buttonInfo: {
    backgroundColor: theme.colors.info,
    ...theme.shadows.sm,
  },
  buttonOutline: {
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: theme.colors.primary,
  },
  buttonText: {
    backgroundColor: "transparent",
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonLabel: {
    fontWeight: theme.typography.fontWeights.semibold,
  },
  textSmall: {
    fontSize: theme.typography.fontSizes.xs,
  },
  textMedium: {
    fontSize: theme.typography.fontSizes.sm,
  },
  textLarge: {
    fontSize: theme.typography.fontSizes.md,
  },
  textPrimary: {
    color: theme.colors.white,
  },
  textSecondary: {
    color: theme.colors.primary,
  },
  textDanger: {
    color: theme.colors.white,
  },
  textSuccess: {
    color: theme.colors.white,
  },
  textWarning: {
    color: theme.colors.white,
  },
  textInfo: {
    color: theme.colors.white,
  },
  textOutline: {
    color: theme.colors.primary,
  },
  textPlain: {
    color: theme.colors.primary,
  },
  textDisabled: {
    color: theme.colors.textMuted,
  },
  iconLeft: {
    marginRight: theme.spacing.xs,
  },
  iconRight: {
    marginLeft: theme.spacing.xs,
  },
});

export default CustomButton;
