import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LoginScreen } from '../screens/LoginScreen';
import { ShipmentsScreen } from '../screens/ShipmentsScreen';
import { theme } from '../theme/theme';

export type RootStackParamList = {
  Login: undefined;
  Shipments: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export const AppNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="Login"
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: theme.colors.background },
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Shipments" component={ShipmentsScreen} />
    </Stack.Navigator>
  );
};
