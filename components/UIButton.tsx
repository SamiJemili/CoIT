import React from 'react';
import { Pressable, Text, StyleSheet, ViewStyle, StyleProp, TextStyle } from 'react-native';
import { colors } from '../lib/theme';

type Props = {
  title?: string;
  onPress?: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  children?: React.ReactNode;
};

export default function UIButton({ title, onPress, disabled, style, textStyle, children }: Props) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        pressed && !disabled && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}
    >
      {title ? <Text style={[styles.text, textStyle]}>{title}</Text> : children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: colors.accent,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  pressed: {
    opacity: 0.7,
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    color: colors.bg,
      fontFamily: 'InterBold',

  },
});