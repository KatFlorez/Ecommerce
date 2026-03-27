import { useNavigation } from '@react-navigation/native';

import { useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { loginUser } from '../api/backend';

const ERR_EMAIL_EMPTY = 'Ingresa tu correo electrónico.';
const ERR_EMAIL_FORMAT = 'El correo no tiene un formato válido.';
const ERR_PASSWORD_EMPTY = 'Ingresa tu contraseña.';
const ERR_CREDENTIALS =
    'Estas credenciales no coinciden con nuestros registros.';
const SESSION_KEY = 'session_logged_in';

function correoPareceValido(texto: string) {
    if (!texto.includes('@')) return false;
    const despuesArroba = texto.split('@')[1] ?? '';
    return despuesArroba.includes('.');
}

export default function Login() {
    const navigation = useNavigation<any>();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [loading, setLoading] = useState(false);

    const emailInvalid = emailError !== '';

    const passwordInvalid =
        passwordError !== '' || emailError === ERR_CREDENTIALS;

    function borrarErrores() {
        setEmailError('');
        setPasswordError('');
    }

    async function handleLogin() {
        setEmailError('');
        setPasswordError('');

        const trimmedEmail = email.trim();

        if (trimmedEmail === '') {
            setEmailError(ERR_EMAIL_EMPTY);
            return;
        }
        if (!correoPareceValido(trimmedEmail)) {
            setEmailError(ERR_EMAIL_FORMAT);
            return;
        }
        if (password === '') {
            setPasswordError(ERR_PASSWORD_EMPTY);
            return;
        }

        setLoading(true);
        try {
            await loginUser(trimmedEmail, password);
            await AsyncStorage.setItem(SESSION_KEY, '1');
            navigation.reset({
                index: 0,
                routes: [{ name: 'Home' }],
            });
        } catch (e) {
            const msg = e instanceof Error ? e.message : String(e);
            if (
                msg.includes('Network request failed') ||
                msg.includes('Failed to fetch')
            ) {
                setEmailError(
                    'No hay conexión con el servidor. Revisa que el backend esté activo.'
                );
            } else {
                setEmailError(ERR_CREDENTIALS);
            }
        } finally {
            setLoading(false);
        }
    }

    return (
        <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
            <View style={styles.ambientTop} />
            <View style={styles.ambientBottom} />

            <KeyboardAvoidingView
                style={styles.flex}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <ScrollView
                    contentContainerStyle={styles.scroll}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.header}>
                        <View style={styles.divider} />
                        <Text style={styles.overline}>tu espacio · ecommerce</Text>
                        <Text style={styles.headline}>Bienvenida</Text>
                        <Text style={styles.headlineAccent}>de vuelta</Text>
                        <Text style={styles.subhead}>
                            Una interfaz pensada con calma, para que entrar sea
                            sencillo y bonito.
                        </Text>
                    </View>

                    <View style={styles.card}>
                        <View style={styles.fieldBlock}>
                            <Text style={styles.label}>Correo electrónico</Text>
                            <TextInput
                                value={email}
                                onChangeText={(nuevoTexto) => {
                                    setEmail(nuevoTexto);
                                    borrarErrores();
                                }}
                                style={[
                                    styles.input,
                                    emailInvalid ? styles.inputError : null,
                                ]}
                                placeholder="nombre@correo.com"
                                placeholderTextColor="#b8a8b5"
                                keyboardType="email-address"
                                autoCapitalize="none"
                                autoCorrect={false}
                            />
                            {emailError !== '' ? (
                                <Text
                                    style={styles.fieldError}
                                    accessibilityRole="alert"
                                >
                                    {emailError}
                                </Text>
                            ) : null}
                        </View>

                        <View style={styles.fieldBlock}>
                            <Text style={styles.label}>Contraseña</Text>
                            <TextInput
                                value={password}
                                onChangeText={(nuevoTexto) => {
                                    setPassword(nuevoTexto);
                                    borrarErrores();
                                }}
                                style={[
                                    styles.input,
                                    passwordInvalid ? styles.inputError : null,
                                ]}
                                placeholder="········"
                                placeholderTextColor="#b8a8b5"
                                secureTextEntry
                            />
                            {passwordError !== '' ? (
                                <Text
                                    style={styles.fieldError}
                                    accessibilityRole="alert"
                                >
                                    {passwordError}
                                </Text>
                            ) : null}
                        </View>

                        <TouchableOpacity
                            style={styles.button}
                            onPress={handleLogin}
                            disabled={loading}
                            activeOpacity={0.88}
                        >
                            <Text style={styles.buttonText}>
                                {loading ? 'Validando...' : 'Iniciar sesión'}
                            </Text>
                        </TouchableOpacity>

                        <View style={styles.footer}>
                            <Text style={styles.footerText}>
                                Al continuar, aceptas nuestros{' '}
                                <Text style={styles.footerLink}>
                                    Términos y condiciones
                                </Text>
                                .
                            </Text>
                            <Text style={[styles.recoverLine, styles.footerSpacer]}>
                                ¿Olvidaste tu contraseña?{' '}
                                <Text style={styles.footerLink}>
                                    Recuperar contraseña
                                </Text>
                            </Text>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: {
        flex: 1,
        backgroundColor: '#f8f4f1',
        overflow: 'hidden',
    },
    flex: {
        flex: 1,
    },
    ambientTop: {
        position: 'absolute',
        width: 320,
        height: 320,
        borderRadius: 160,
        backgroundColor: '#eec8d6',
        opacity: 0.22,
        top: -120,
        right: -80,
    },
    ambientBottom: {
        position: 'absolute',
        width: 260,
        height: 260,
        borderRadius: 130,
        backgroundColor: '#c5b8d4',
        opacity: 0.18,
        bottom: -70,
        left: -90,
    },
    scroll: {
        flexGrow: 1,
        justifyContent: 'center',
        paddingHorizontal: 28,
        paddingVertical: 32,
    },
    header: {
        marginBottom: 28,
    },
    divider: {
        width: 40,
        height: 2,
        backgroundColor: '#b76e79',
        marginBottom: 16,
        opacity: 0.85,
    },
    overline: {
        fontSize: 11,
        letterSpacing: 3.2,
        textTransform: 'uppercase',
        color: '#7d6b73',
        fontWeight: '600',
        marginBottom: 14,
    },
    headline: {
        fontSize: 34,
        fontWeight: '300',
        color: '#36262f',
        letterSpacing: 0.5,
    },
    headlineAccent: {
        fontSize: 34,
        fontWeight: '500',
        color: '#8b4d5c',
        marginTop: -4,
        marginBottom: 14,
        letterSpacing: 0.5,
    },
    subhead: {
        fontSize: 15,
        lineHeight: 24,
        color: '#6a5a63',
        fontWeight: '400',
        maxWidth: 320,
    },
    card: {
        backgroundColor: '#fffdfc',
        borderRadius: 24,
        padding: 28,
        width: '100%',
        maxWidth: 400,
        alignSelf: 'center',
        borderWidth: 1,
        borderColor: 'rgba(54, 38, 47, 0.08)',
        shadowColor: '#36262f',
        shadowOffset: { width: 0, height: 18 },
        shadowOpacity: 0.07,
        shadowRadius: 40,
        elevation: 6,
    },
    fieldBlock: {
        marginBottom: 6,
    },
    fieldError: {
        marginTop: 8,
        fontSize: 13,
        lineHeight: 19,
        color: '#c45c6a',
        fontWeight: '500',
        alignSelf: 'stretch',
    },
    label: {
        alignSelf: 'flex-start',
        color: '#4a3b42',
        fontSize: 12,
        letterSpacing: 1.4,
        textTransform: 'uppercase',
        fontWeight: '600',
        marginBottom: 8,
        marginTop: 2,
    },
    input: {
        backgroundColor: '#faf6f4',
        borderWidth: 1,
        borderColor: 'rgba(54, 38, 47, 0.12)',
        borderRadius: 14,
        paddingHorizontal: 16,
        paddingVertical: Platform.OS === 'ios' ? 15 : 13,
        width: '100%',
        fontSize: 16,
        color: '#36262f',
        fontWeight: '400',
    },
    inputError: {
        borderColor: 'rgba(183, 110, 121, 0.65)',
        backgroundColor: '#fffbfb',
    },
    button: {
        backgroundColor: '#6b4550',
        paddingVertical: 16,
        borderRadius: 999,
        width: '100%',
        alignItems: 'center',
        marginTop: 20,
        shadowColor: '#6b4550',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.22,
        shadowRadius: 18,
        elevation: 5,
    },
    buttonText: {
        color: '#fffbfa',
        fontWeight: '600',
        fontSize: 16,
        letterSpacing: 0.8,
    },
    footer: {
        marginTop: 22,
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: 'rgba(54, 38, 47, 0.08)',
    },
    footerSpacer: {
        marginTop: 14,
    },
    footerText: {
        fontSize: 12,
        color: '#8c7b82',
        textAlign: 'center',
        fontWeight: '400',
        lineHeight: 18,
    },
    recoverLine: {
        fontSize: 12,
        color: '#6a5a63',
        textAlign: 'center',
        fontWeight: '500',
        lineHeight: 18,
    },
    footerLink: {
        color: '#8b4d5c',
        fontWeight: '600',
        textDecorationLine: 'underline',
        textDecorationColor: 'rgba(139, 77, 92, 0.45)',
    },
});
