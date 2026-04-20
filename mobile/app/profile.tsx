import React from 'react'
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import { Colors } from '@/constants/theme'
import { GlassCard } from '@/components/GlassCard'
import { setAuthToken } from '@/lib/api'

const MENU: { icon: string; label: string; badge?: string; onPress?: () => void }[] = [
  { icon: 'bag-outline', label: 'Moje zamówienia', badge: '3', onPress: () => router.push('/orders') },
  { icon: 'sparkles-outline', label: 'Studio AI', onPress: () => router.push('/ai') },
  { icon: 'notifications-outline', label: 'Powiadomienia', badge: '5' },
  { icon: 'settings-outline', label: 'Ustawienia' },
  { icon: 'shield-checkmark-outline', label: 'Prywatność i bezpieczeństwo' },
]

export default function ProfileScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <GlassCard style={styles.profileCard} padding={24}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>JK</Text>
            </View>
          </View>
          <Text style={styles.name}>Jan Kowalski</Text>
          <Text style={styles.email}>jan.kowalski@email.com</Text>
          <View style={styles.statsRow}>
            {[['23', 'Zamówienia'], ['12', 'Ulubione'], ['4.8 ★', 'Ocena']].map(([v, l]) => (
              <View key={l} style={styles.stat}>
                <Text style={styles.statValue}>{v}</Text>
                <Text style={styles.statLabel}>{l}</Text>
              </View>
            ))}
          </View>
        </GlassCard>

        <View style={styles.roleRow}>
          <GlassCard style={[styles.roleCard, { borderColor: 'rgba(0,212,255,0.3)' }]} padding={16}>
            <Ionicons name="storefront" size={22} color={Colors.neonCyan} />
            <Text style={styles.roleTitle}>Strefa sprzedawcy</Text>
            <Text style={styles.roleDesc}>Zarządzaj sklepem i ofertą</Text>
          </GlassCard>
          <TouchableOpacity style={{ flex: 1 }} onPress={() => router.push('/ai')}>
            <GlassCard style={[styles.roleCard, { borderColor: 'rgba(240,89,218,0.3)' }]} padding={16}>
              <Ionicons name="sparkles" size={22} color={Colors.neonPink} />
              <Text style={styles.roleTitle}>Studio AI</Text>
              <Text style={styles.roleDesc}>Opisy, support i naprawy</Text>
            </GlassCard>
          </TouchableOpacity>
        </View>

        {MENU.map(({ icon, label, badge, onPress }) => (
          <TouchableOpacity key={label} onPress={onPress} activeOpacity={0.85}>
            <GlassCard padding={14} style={styles.menuItem}>
              <View style={styles.menuIcon}>
                <Ionicons name={icon as any} size={20} color={Colors.textSecondary} />
              </View>
              <Text style={styles.menuLabel}>{label}</Text>
              {badge && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{badge}</Text>
                </View>
              )}
              <View style={styles.chevron}>
                <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
              </View>
            </GlassCard>
          </TouchableOpacity>
        ))}

        <TouchableOpacity onPress={() => { setAuthToken(null); router.replace('/login') }}>
          <GlassCard padding={14} style={styles.signOut}>
            <Ionicons name="log-out-outline" size={20} color="#f87171" />
            <Text style={styles.signOutText}>Wyloguj się</Text>
          </GlassCard>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { padding: 16, gap: 12 },
  profileCard: {
    alignItems: 'center',
    backgroundColor: 'rgba(124,58,237,0.05)',
    borderColor: 'rgba(124,58,237,0.2)',
  },
  avatarContainer: { marginBottom: 12 },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.neonViolet,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: Colors.white, fontSize: 28, fontWeight: '900' },
  name: { color: Colors.white, fontSize: 20, fontWeight: '800', marginBottom: 4 },
  email: { color: Colors.textMuted, fontSize: 13, marginBottom: 16 },
  statsRow: { flexDirection: 'row', gap: 24 },
  stat: { alignItems: 'center' },
  statValue: { color: Colors.neonCyan, fontWeight: '800', fontSize: 16 },
  statLabel: { color: Colors.textMuted, fontSize: 11 },
  roleRow: { flexDirection: 'row', gap: 12 },
  roleCard: { flex: 1, gap: 6 },
  roleTitle: { color: Colors.white, fontWeight: '700', fontSize: 14 },
  roleDesc: { color: Colors.textMuted, fontSize: 12 },
  menuItem: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.glass,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  menuLabel: { color: Colors.white, fontWeight: '600', fontSize: 14, flex: 1 },
  badge: { backgroundColor: Colors.neonCyan, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12 },
  badgeText: { color: '#000', fontSize: 11, fontWeight: '700' },
  chevron: { marginLeft: 'auto' as any },
  signOut: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  signOutText: { color: '#f87171', fontWeight: '600', fontSize: 15 },
})
