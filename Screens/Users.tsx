import React, { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';

import { PanelSidebar } from '../components/PanelSidebar';
import { createUser, deleteUser, getUsers, updateUser } from '../api/backend';
import type { User } from '../api/backend';

function iniciales(nombre: string, apellido: string) {
  const limpio = `${nombre || ''} ${apellido || ''}`.trim();
  if (!limpio) return '?';
  const partes = limpio.split(/\s+/);
  const a = partes[0]?.[0] ?? '?';
  const b = partes.length > 1 ? partes[partes.length - 1]?.[0] : '';
  return String(a + b).toUpperCase();
}

export default function Users() {
  const { width } = useWindowDimensions();
  const mobile = width < 900;
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [form, setForm] = useState({
    nombre: '',
    apellido: '',
    correo: '',
    password: '',
  });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  async function refreshUsers() {
    setLoading(true);
    try {
      const data = await getUsers();
      setUsers(data.users);
    } catch (_e) {
      Alert.alert('Error', 'No se pudieron cargar los usuarios.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refreshUsers();
  }, []);

  function closeModal() {
    setModalVisible(false);
    setForm({ nombre: '', apellido: '', correo: '', password: '' });
    setEditingId(null);
  }

  function openCreateModal() {
    setEditingId(null);
    setForm({ nombre: '', apellido: '', correo: '', password: '' });
    setModalVisible(true);
  }

  function openEditModal(u: User) {
    setEditingId(u.id);
    setForm({
      nombre: u.nombre,
      apellido: u.apellido,
      correo: u.correo,
      password: '',
    });
    setModalVisible(true);
  }

  async function submit() {
    if (
      !form.nombre.trim() ||
      !form.apellido.trim() ||
      !form.correo.trim() ||
      !form.password.trim()
    ) {
      Alert.alert(
        'Falta información',
        'Completa nombre, apellido, correo y contraseña.'
      );
      return;
    }

    setLoading(true);
    try {
      if (editingId === null) {
        await createUser(form);
      } else {
        await updateUser(editingId, form);
      }
      await refreshUsers();
      closeModal();
    } catch (_e) {
      Alert.alert('Error', 'No se pudo guardar el usuario.');
    } finally {
      setLoading(false);
    }
  }

  async function onDelete(id: number) {
    Alert.alert('Eliminar', '¿Seguro que quieres borrar este usuario?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Borrar',
        style: 'destructive',
        onPress: async () => {
          setLoading(true);
          try {
            await deleteUser(id);
            await refreshUsers();
          } catch (_e) {
            Alert.alert('Error', 'No se pudo eliminar.');
          } finally {
            setLoading(false);
          }
        },
      },
    ]);
  }

  return (
    <View style={[styles.shell, mobile && styles.shellMobile]}>
      <PanelSidebar active="Users" />

      <ScrollView style={styles.main} contentContainerStyle={[styles.mainContent, mobile && styles.mainContentMobile]}>
        <View style={styles.section}>
          <Text style={[styles.welcome, mobile && styles.welcomeMobile]}>Gestión de Usuarios</Text>
          <Text style={styles.subtitle}>
            Crea, edita y elimina usuarios.
          </Text>

          <View style={[styles.usersTopBar, mobile && styles.usersTopBarMobile]}>
            <Text style={styles.tableTitle}>Listado de clientes</Text>

            <TouchableOpacity
              style={styles.newBtn}
              onPress={openCreateModal}
              activeOpacity={0.9}
            >
              <Text style={styles.newBtnText}>Agregar</Text>
            </TouchableOpacity>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={mobile} contentContainerStyle={styles.tableWrap}>
            <View style={styles.tableMinWidth}>
              <View style={styles.tableHeaderRow}>
                <Text style={[styles.th, styles.colName]}>Nombre</Text>
                <Text style={[styles.th, styles.colLastName]}>Apellido</Text>
                <Text style={[styles.th, styles.colEmail]}>Correo</Text>
                <Text style={[styles.th, styles.colDate]}>Registrado</Text>
                <Text style={[styles.th, styles.colActions]}>Acciones</Text>
              </View>

              {users.length === 0 ? (
                <Text style={styles.emptyText}>
                  {loading ? 'Cargando...' : 'No hay usuarios todavía.'}
                </Text>
              ) : (
                <FlatList
                  data={users}
                  keyExtractor={(item) => String(item.id)}
                  contentContainerStyle={styles.tableBody}
                  scrollEnabled={false}
                  renderItem={({ item }) => (
                    <View style={styles.tableRow}>
                      <View style={[styles.td, styles.tdName]}>
                        <View style={styles.avatar}>
                          <Text style={styles.avatarText}>
                            {iniciales(item.nombre, item.apellido)}
                          </Text>
                        </View>

                        <View style={styles.nameStack}>
                          <Text style={styles.userName}>{item.nombre}</Text>
                        </View>
                      </View>

                      <Text style={[styles.td, styles.tdLastName]} numberOfLines={1}>
                        {item.apellido}
                      </Text>
                      <Text style={[styles.td, styles.tdEmail]} numberOfLines={1}>
                        {item.correo}
                      </Text>
                      <Text style={[styles.td, styles.tdDate]}>
                        {String(item.created_at).slice(0, 10)}
                      </Text>

                      <View style={[styles.td, styles.tdActions]}>
                        <TouchableOpacity
                          style={styles.actionEdit}
                          onPress={() => openEditModal(item)}
                          activeOpacity={0.9}
                        >
                          <Text style={styles.actionEditText}>Editar</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={[styles.actionDelete, { marginLeft: 8 }]}
                          onPress={() => onDelete(item.id)}
                          activeOpacity={0.9}
                        >
                          <Text style={styles.actionDeleteText}>Eliminar</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}
                />
              )}
            </View>
          </ScrollView>

          <Modal
            visible={modalVisible}
            transparent
            animationType="fade"
            onRequestClose={closeModal}
          >
            <View style={styles.modalBackdrop}>
              <View style={styles.modalCard}>
                <Text style={styles.modalTitle}>
                  {editingId === null ? 'Agregar usuario' : `Editar usuario #${editingId}`}
                </Text>

                <ScrollView contentContainerStyle={styles.modalContent}>
                  <Text style={styles.inputLabel}>Nombre</Text>
                  <TextInput
                    style={styles.input}
                    value={form.nombre}
                    onChangeText={(t) => setForm((f) => ({ ...f, nombre: t }))}
                    placeholder="Ej: María"
                  />

                  <Text style={styles.inputLabel}>Apellido</Text>
                  <TextInput
                    style={styles.input}
                    value={form.apellido}
                    onChangeText={(t) => setForm((f) => ({ ...f, apellido: t }))}
                    placeholder="Ej: Pérez"
                  />

                  <Text style={styles.inputLabel}>Correo</Text>
                  <TextInput
                    style={styles.input}
                    value={form.correo}
                    onChangeText={(t) => setForm((f) => ({ ...f, correo: t }))}
                    placeholder="maria@correo.com"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />

                  <Text style={styles.inputLabel}>Contraseña</Text>
                  <TextInput
                    style={styles.input}
                    value={form.password}
                    onChangeText={(t) => setForm((f) => ({ ...f, password: t }))}
                    placeholder="••••••"
                    secureTextEntry
                  />

                  <View style={styles.modalButtonsRow}>
                    <TouchableOpacity
                      style={styles.modalCancelBtn}
                      onPress={closeModal}
                      activeOpacity={0.9}
                    >
                      <Text style={styles.modalCancelText}>Cancelar</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.modalSaveBtn}
                      onPress={submit}
                      activeOpacity={0.9}
                    >
                      <Text style={styles.modalSaveText}>
                        {editingId === null ? 'Guardar' : 'Actualizar'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </ScrollView>
              </View>
            </View>
          </Modal>
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

  inputLabel: { fontSize: 12, fontWeight: '900', color: '#7d6b73', marginBottom: 6, marginTop: 10 },
  input: {
    backgroundColor: '#faf6f4',
    borderWidth: 1,
    borderColor: 'rgba(54, 38, 47, 0.12)',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
    color: '#36262f',
    fontWeight: '500',
  },

  tableTitle: { fontWeight: '900', color: '#36262f', marginTop: 8, marginBottom: 10 },
  emptyText: { color: '#8c7b82', fontWeight: '700', textAlign: 'center', marginTop: 20 },

  usersTopBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    marginBottom: 10,
  },
  usersTopBarMobile: { flexDirection: 'column', alignItems: 'flex-start', gap: 8 },
  newBtn: {
    backgroundColor: '#6b4550',
    borderRadius: 999,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  newBtnText: { color: '#fffbfa', fontWeight: '900' },

  tableHeaderRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(54, 38, 47, 0.08)',
  },
  th: {
    fontSize: 12,
    color: '#7d6b73',
    fontWeight: '900',
  },
  colName: { flex: 1.5 },
  colLastName: { flex: 1.5 },
  colEmail: { flex: 2 },
  colDate: { flex: 1 },
  colActions: { flex: 1 },

  tableBody: { paddingBottom: 14 },
  tableWrap: { paddingBottom: 4 },
  tableMinWidth: { minWidth: 760, width: '100%' },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: '#fffdfc',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(54, 38, 47, 0.06)',
    alignItems: 'center',
  },
  td: { justifyContent: 'center' },
  tdName: { flex: 1.5, flexDirection: 'row', alignItems: 'center' },
  tdLastName: { flex: 1.5 },
  tdEmail: { flex: 2 },
  tdDate: { flex: 1 },
  tdActions: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  nameStack: { flex: 1 },

  actionEdit: {
    backgroundColor: 'rgba(168, 85, 247, 0.18)',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  actionEditText: { color: '#6b4550', fontWeight: '900', fontSize: 12 },

  actionDelete: {
    backgroundColor: '#f43f5e',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  actionDeleteText: { color: '#fff', fontWeight: '900', fontSize: 12 },

  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    paddingHorizontal: 18,
  },
  modalCard: {
    backgroundColor: '#fffdfc',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(54, 38, 47, 0.08)',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#36262f',
    marginBottom: 12,
  },
  modalContent: { paddingBottom: 12 },
  modalButtonsRow: { flexDirection: 'row', marginTop: 16 },
  modalCancelBtn: {
    flex: 1,
    backgroundColor: 'rgba(107, 69, 80, 0.10)',
    paddingVertical: 14,
    borderRadius: 999,
    alignItems: 'center',
  },
  modalCancelText: { color: '#6b4550', fontWeight: '900' },
  modalSaveBtn: {
    flex: 1,
    marginLeft: 12,
    backgroundColor: '#6b4550',
    paddingVertical: 14,
    borderRadius: 999,
    alignItems: 'center',
  },
  modalSaveText: { color: '#fffbfa', fontWeight: '900' },

  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(107, 69, 80, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(107, 69, 80, 0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontWeight: '900',
    color: '#6b4550',
    fontSize: 13,
    letterSpacing: 0.5,
  },
  userName: { fontWeight: '900', color: '#36262f', marginBottom: 4 },
});
