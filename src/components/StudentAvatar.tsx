import React, { useEffect, useState } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Student } from "../types";

interface StudentAvatarProps {
  student: Student;
  token?: string;
  size?: number;
  showBorder?: boolean;
  borderColor?: string;
}

export const StudentAvatar: React.FC<StudentAvatarProps> = ({
  student,
  token,
  size = 40,
  showBorder = false,
  borderColor = "#2563EB",
}) => {
  const [imgError, setImgError] = useState(false);
  const [customPhoto, setCustomPhoto] = useState<string | null>(null);

  // Check for local custom photo override
  useEffect(() => {
    let isMounted = true;
    if (student?.id) {
      AsyncStorage.getItem(`@ecoledirecte:custom_photo_${student.id}`).then((val) => {
        if (isMounted && val) setCustomPhoto(val);
      }).catch(() => {});
    }
    return () => {
      isMounted = false;
    };
  }, [student?.id]);

  // Generate initials
  const initials = `${student.prenom?.[0] || ""}${student.nom?.[0] || ""}`.toUpperCase() || "E";

  // Generate deterministic pastel color based on student name
  const colors = ["#2563EB", "#7C3AED", "#059669", "#D97706", "#DC2626", "#0891B2"];
  const charCode = (student.prenom?.charCodeAt(0) || 0) + (student.nom?.charCodeAt(0) || 0);
  const bgColor = colors[charCode % colors.length];

  const rawPhoto = customPhoto || student.photo;
  let photoUri: string | null = null;
  if (rawPhoto && typeof rawPhoto === "string" && rawPhoto.trim().length > 0 && rawPhoto !== "undefined") {
    let clean = rawPhoto.trim();
    if (clean.startsWith("//")) clean = `https:${clean}`;
    else if (!clean.startsWith("http")) clean = `https://${clean}`;

    // doc1.ecoledirecte.com has direct HTTPS connection timeouts from French residential ISPs (OVH filtering)
    // Routing through images.weserv.nl proxies and caches the JPEG with 100% reliability
    if (clean.includes("doc1.ecoledirecte.com")) {
      const pathOnly = clean.replace(/^https?:\/\//, "");
      photoUri = `https://images.weserv.nl/?url=${encodeURIComponent(pathOnly)}&w=${size * 2}&h=${size * 2}&fit=cover`;
    } else {
      photoUri = clean;
    }
  }

  const containerStyle = {
    width: size,
    height: size,
    borderRadius: size / 2,
    borderWidth: showBorder ? 2 : 0,
    borderColor: showBorder ? borderColor : "transparent",
  };

  if (photoUri && !imgError) {
    return (
      <View style={[styles.container, containerStyle]}>
        <Image
          source={{ uri: photoUri }}
          style={{ width: "100%", height: "100%", borderRadius: size / 2 }}
          resizeMode="cover"
          onError={(e) => {
            console.log("[AVATAR] Erreur chargement photo pour", student.prenom, ":", e.nativeEvent?.error);
            setImgError(true);
          }}
        />
      </View>
    );
  }

  return (
    <View style={[styles.container, containerStyle, { backgroundColor: bgColor }]}>
      <Text style={[styles.initials, { fontSize: Math.max(12, Math.floor(size * 0.38)) }]}>
        {initials}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  initials: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
});
