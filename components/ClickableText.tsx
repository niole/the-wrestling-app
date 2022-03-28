import * as React from 'react';
import { StyleSheet, Text, Pressable } from 'react-native';

type Props = {
  children: string;
  onPress?: () => void;
  disabled?: boolean;
};

export function ClickableText({ children, onPress, disabled = false }: Props) {
  return (
    <Pressable disabled={disabled} onPress={onPress}>
      <Text style={[styles.base, disabled ? styles.disabled : styles.active]}>
        {children}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { fontSize: 18 },
  disabled: { color: 'grey' },
  active: { color: 'blue' },
});
