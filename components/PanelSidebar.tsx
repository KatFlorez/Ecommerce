import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export function PanelSidebar({ active }: { active: 'Home' | 'Users' }) {
  const navigation = useNavigation<any>();
  const { width } = useWindowDimensions();
  const mobile = width < 900;

  return (
    <View style={[styles.sidebar, mobile && styles.sidebarMobile]}>
      <Text style={[styles.sidebarTitle, mobile && styles.sidebarTitleMobile]}>Panel</Text>

      <TouchableOpacity
        style={[styles.sideItem, mobile && styles.sideItemMobile, active === 'Home' && styles.sideItemActive]}
        onPress={() => navigation.navigate('Home')}
      >
        <Text style={[styles.sideItemText, active === 'Home' && styles.sideItemTextActive]}>
          Home
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.sideItem, mobile && styles.sideItemMobile, active === 'Users' && styles.sideItemActive]}
        onPress={() => navigation.navigate('Users')}
      >
        <Text style={[styles.sideItemText, active === 'Users' && styles.sideItemTextActive]}>
          Usuarios (CRUD)
        </Text>
      </TouchableOpacity>

      {!mobile ? <View style={styles.sidebarDivider} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  sidebar: {
    width: 240,
    backgroundColor: '#fffdfc',
    paddingTop: 24,
    paddingHorizontal: 16,
    borderRightWidth: 1,
    borderRightColor: 'rgba(54, 38, 47, 0.08)',
  },
  sidebarMobile: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 10,
    borderRightWidth: 0,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(54, 38, 47, 0.08)',
    gap: 8,
  },
  sidebarTitle: { fontSize: 18, fontWeight: '800', color: '#36262f', marginBottom: 18 },
  sidebarTitleMobile: { marginBottom: 0, marginRight: 8 },
  sideItem: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 14,
    backgroundColor: 'transparent',
  },
  sideItemMobile: { paddingVertical: 10 },
  sideItemActive: { backgroundColor: 'rgba(107, 69, 80, 0.10)' },
  sideItemText: { color: '#6a5a63', fontWeight: '700' },
  sideItemTextActive: { color: '#6b4550' },
  sidebarDivider: {
    height: 1,
    backgroundColor: 'rgba(54, 38, 47, 0.08)',
    marginVertical: 18,
  },
  sidebarHint: { color: '#8c7b82', fontWeight: '600', fontSize: 12, marginTop: 10 },
});
