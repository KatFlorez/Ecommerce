import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Login from './Screens/Login';
import Home from './Screens/Home';
import Users from './Screens/Users';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';

const Stack = createNativeStackNavigator();
const SESSION_KEY = 'session_logged_in';

export default function App() {
  const [checkingSession, setCheckingSession] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    async function loadSession() {
      try {
        const saved = await AsyncStorage.getItem(SESSION_KEY);
        setIsLoggedIn(saved === '1');
      } finally {
        setCheckingSession(false);
      }
    }
    loadSession();
  }, []);

  if (checkingSession) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={isLoggedIn ? 'Home' : 'Login'}>
        <Stack.Screen name="Login" component={Login} options={{ headerShown: false }} />
        <Stack.Screen name="Home" component={Home} options={{ headerShown: false }} />
        <Stack.Screen name="Users" component={Users} options={{ headerShown: false }} />
      </Stack.Navigator>
    </NavigationContainer>

  );
}
