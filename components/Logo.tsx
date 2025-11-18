import React from "react";
import { Image, ImageStyle, StyleSheet, View, ViewStyle } from "react-native";

type LogoProps = {
  size?: number;
  style?: ViewStyle | ImageStyle;
  showBackground?: boolean;
};

/**
 * Composant Logo réutilisable pour l'application
 * 
 * Le composant utilise logo.png depuis assets/images/logo.png
 * Pour une qualité optimale, assurez-vous que le logo fait au minimum 2048x2048px
 */
export default function Logo({ size = 120, style, showBackground = false }: LogoProps) {
  const logoSize = size;
  const logoSource = require("../assets/images/logo.png");

  return (
    <View style={[styles.container, { width: logoSize, height: logoSize }, style]}>
      {showBackground && (
        <View style={[styles.background, { width: logoSize, height: logoSize, borderRadius: logoSize / 2 }]} />
      )}
      <Image
        source={logoSource}
        style={[styles.logo, { width: logoSize, height: logoSize}]}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
  },
  background: {
    position: "absolute",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  logo: {
    // L'image sera redimensionnée pour s'adapter au conteneur
  },
});

