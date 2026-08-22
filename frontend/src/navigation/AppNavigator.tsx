import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LoginScreen } from '../screens/LoginScreen';
import { ShipmentsScreen } from '../screens/ShipmentsScreen';
import { ShipmentDetailsScreen } from '../screens/ShipmentDetailsScreen';
import { AlertsScreen } from '../screens/AlertsScreen';
import { AuditScreen } from '../screens/AuditScreen';
import { theme } from '../theme/theme';

export type RootStackParamList = {
  Login: undefined;
  Shipments: undefined;
  ShipmentDetails: { shipmentId: string };
  Alerts: { shipmentId: string };
  Audit: { shipmentId: string };
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
      <Stack.Screen name="ShipmentDetails" component={ShipmentDetailsScreen} />
      <Stack.Screen name="Alerts" component={AlertsScreen} />
      <Stack.Screen name="Audit" component={AuditScreen} />
    </Stack.Navigator>
  );
};
