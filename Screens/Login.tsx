/**
 * Login.tsx — Pantalla de inicio de sesión
 *
 * Ideas clave de React Native (parecido a React en web):
 * - Un "componente" es una función que DEVUELVE (return) la interfaz (JSX).
 * - useState guarda valores que pueden cambiar (email, errores). Cuando cambian,
 *   React vuelve a dibujar la pantalla.
 * - Los componentes de RN NO son HTML: <View> ≈ <div>, <Text> ≈ <p>, etc.
 */

// Herramientas para cambiar de pantalla (navegación)
import { useNavigation } from '@react-navigation/native';
// Hook de React para estado local (memoria del componente)
import { useState } from 'react';
import {
    View, // Caja: agrupa otros elementos
    Text, // Texto (todo texto visible debe ir dentro de <Text>)
    TextInput, // Campo para escribir
    TouchableOpacity, // Botón al que se le puede hacer tap
    StyleSheet, // Objeto de estilos optimizado para RN
    KeyboardAvoidingView, // Evita que el teclado tape el formulario (sobre todo iOS)
    Platform, // Dice si la app corre en 'ios' o 'android'
    ScrollView, // Permite desplazar el contenido si no cabe en pantalla
} from 'react-native';
// Respeta el "notch" y la barra de inicio del teléfono
import { SafeAreaView } from 'react-native-safe-area-context';

// Mensajes de error como constantes: un solo lugar si quieres cambiar el texto
const ERR_EMAIL_EMPTY = 'Ingresa tu correo electrónico.';
const ERR_EMAIL_FORMAT = 'El correo no tiene un formato válido.';
const ERR_PASSWORD_EMPTY = 'Ingresa tu contraseña.';
const ERR_CREDENTIALS =
    'Estas credenciales no coinciden con nuestros registros.';

/**
 * Comprueba algo muy básico de correo: que tenga @ y un punto después.
 * (No es perfecto, pero es fácil de leer mientras aprendes.)
 */
function correoPareceValido(texto: string) {
    if (!texto.includes('@')) return false;
    const despuesArroba = texto.split('@')[1] ?? '';
    return despuesArroba.includes('.');
}

// "export default" = este archivo exporta UN componente principal
export default function Login() {
    // Navegación: <any> es un atajo de TypeScript mientras aprendes;
    // más adelante se puede tipar bien con los tipos de React Navigation.
    const navigation = useNavigation<any>();

    // useState(valorInicial) devuelve [valorActual, funciónParaCambiarlo]
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');

    // Si hay mensaje bajo el correo → el input se ve "con error"
    const emailInvalid = emailError !== '';

    // Borde rojo en contraseña si falta, O si el login falló (mensaje va bajo el correo)
    const passwordInvalid =
        passwordError !== '' || emailError === ERR_CREDENTIALS;

    function borrarErrores() {
        setEmailError('');
        setPasswordError('');
    }

    function handleLogin() {
        // Limpiamos errores viejos antes de volver a validar
        setEmailError('');
        setPasswordError('');

        const trimmedEmail = email.trim();

        if (trimmedEmail === '') {
            setEmailError(ERR_EMAIL_EMPTY);
            return; // Salimos: no sigue el resto de la función
        }
        if (!correoPareceValido(trimmedEmail)) {
            setEmailError(ERR_EMAIL_FORMAT);
            return;
        }
        if (password === '') {
            setPasswordError(ERR_PASSWORD_EMPTY);
            return;
        }

        // Login de prueba (luego aquí iría una API o Firebase, etc.)
        if (trimmedEmail === 'admin@gmail.com' && password === 'admin') {
            navigation.navigate('Home');
        } else {
            setEmailError(ERR_CREDENTIALS);
        }
    }

    return (
        <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
            {/* Círculos de decoración de fondo (no son interactivos) */}
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
                        {/* Bloque correo: etiqueta + input + texto de error opcional */}
                        <View style={styles.fieldBlock}>
                            <Text style={styles.label}>Correo electrónico</Text>
                            {/* style en array: combina estilos. Si emailInvalid, suma inputError */}
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
                            {/* Mostrar error solo si emailError no es '' */}
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
                            activeOpacity={0.88}
                        >
                            <Text style={styles.buttonText}>Iniciar sesión</Text>
                        </TouchableOpacity>

                        <View style={styles.footer}>
                            <Text style={styles.footerText}>
                                Al continuar, aceptas nuestros{' '}
                                {/* Text dentro de Text = un "span" con otro estilo */}
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
        // En iOS a veces conviene un poco más de padding vertical
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
