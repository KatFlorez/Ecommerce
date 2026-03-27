
import React, { useEffect, useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';

import { PanelSidebar } from '../components/PanelSidebar';
import { getStats } from '../api/backend';

function BarChart({ series }: { series: { day: string; count: number }[] }) {
  const max = useMemo(() => Math.max(...series.map((s) => s.count), 1), [series]);

  return (
    <View style={styles.chartWrap}>
      {series.length === 0 ? (
        <Text style={styles.chartEmpty}>Todavía no hay datos.</Text>
      ) : (
        <View style={styles.chartBarsRow}>
          {series.map((p) => {
            const h = Math.round((p.count / max) * 110);
            return (
              <View key={p.day} style={styles.chartBarCol}>
                <View style={[styles.chartBar, { height: h }]} />
                <Text style={styles.chartBarLabel} numberOfLines={1}>
                  {p.day.slice(5)}
                </Text>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
}

export default function Home() {
  const { width } = useWindowDimensions();
  const mobile = width < 900;
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<{
    usersCount: number;
    createdSeries: { day: string; count: number }[];
  }>({ usersCount: 0, createdSeries: [] });

  async function refreshStats() {
    setLoading(true);
    try {
      const data = await getStats();
      setStats(data);
    } catch (_e) {
      Alert.alert('Error', 'No se pudieron cargar las estadísticas.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refreshStats();
  }, []);

  return (
    <View style={[styles.shell, mobile && styles.shellMobile]}>
      <PanelSidebar active="Home" />

      <ScrollView style={styles.main} contentContainerStyle={[styles.mainContent, mobile && styles.mainContentMobile]}>
        <View style={styles.section}>
          <Text style={[styles.welcome, mobile && styles.welcomeMobile]}>Bienvenida</Text>
          <Text style={styles.subtitle}>
            Dashboard básico para que veas “lo importante” rápido.
          </Text>

          <View style={[styles.cardsRow, mobile && styles.cardsRowMobile]}>
            <View style={[styles.statCard, !mobile && { marginRight: 12 }, mobile && styles.statCardMobile]}>
              <Text style={styles.statLabel}>Cantidad de usuarios</Text>
              <Text style={styles.statValue}>{stats.usersCount}</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Estado</Text>
              <Text style={styles.statValue}>{loading ? 'Cargando...' : 'Listo'}</Text>
            </View>
          </View>

          <Text style={styles.chartTitle}>Usuarios creados (últimos días)</Text>
          <BarChart series={stats.createdSeries} />

          <Text style={styles.note}>
            Nota: la gráfica depende de la tabla `users` que crea el backend.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: { flex: 1, flexDirection: 'row', backgroundColor: '#f8f4f1' },
  shellMobile: { flexDirection: 'column' },
  main: { flex: 1 },
  mainContent: { padding: 22 },
  mainContentMobile: { padding: 14 },
  section: { flex: 1 },

  welcome: { fontSize: 28, fontWeight: '900', color: '#36262f', marginBottom: 6 },
  welcomeMobile: { fontSize: 24 },
  subtitle: {
    fontSize: 14,
    color: '#6a5a63',
    lineHeight: 20,
    marginBottom: 16,
    fontWeight: '500',
  },

  cardsRow: { flexDirection: 'row' },
  cardsRowMobile: { flexDirection: 'column' },
  statCard: {
    flex: 1,
    backgroundColor: '#fffdfc',
    borderWidth: 1,
    borderColor: 'rgba(54, 38, 47, 0.08)',
    borderRadius: 18,
    padding: 14,
  },
  statCardMobile: { marginBottom: 10 },
  statLabel: { color: '#7d6b73', fontWeight: '700', fontSize: 12, marginBottom: 10 },
  statValue: { color: '#36262f', fontWeight: '900', fontSize: 22 },

  chartTitle: {
    marginTop: 18,
    marginBottom: 8,
    fontWeight: '900',
    color: '#36262f',
    fontSize: 14,
  },
  chartWrap: {
    backgroundColor: '#fffdfc',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(54, 38, 47, 0.08)',
    padding: 16,
  },
  chartEmpty: { color: '#8c7b82', fontWeight: '600' },
  chartBarsRow: { flexDirection: 'row', alignItems: 'flex-end', height: 120 },
  chartBarCol: { flex: 1, alignItems: 'center' },
  chartBar: { width: 12, borderRadius: 10, backgroundColor: '#a855f7' },
  chartBarLabel: {
    marginTop: 8,
    fontSize: 10,
    color: '#8c7b82',
    fontWeight: '700',
  },

  note: { marginTop: 12, color: '#8c7b82', fontSize: 12, fontWeight: '600' },
});
