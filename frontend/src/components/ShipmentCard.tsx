import React from 'react';
import { StyleSheet, Text, View, Pressable } from 'react-native';
import { Shipment } from '../types/shipment';
import { IntegrityScore } from './IntegrityScore';
import { theme } from '../theme/theme';
import { Feather } from '@expo/vector-icons';

interface ShipmentCardProps {
  shipment: Shipment;
  onPress?: () => void;
}

export const ShipmentCard: React.FC<ShipmentCardProps> = ({ shipment, onPress }) => {
  // Format status labels for readability
  const formatStatus = (status: string) => {
    return status.replace('_', ' ').toUpperCase();
  };

  // Dynamically styling status badges
  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'DELIVERED':
        return { color: theme.colors.success, bg: theme.colors.successBg };
      case 'IN_TRANSIT':
        return { color: theme.colors.primaryLight, bg: 'rgba(59, 130, 246, 0.15)' };
      case 'DELAYED':
        return { color: theme.colors.warning, bg: theme.colors.warningBg };
      default:
        return { color: theme.colors.textSecondary, bg: theme.colors.surfaceLight };
    }
  };

  // Dynamically styling risk badge
  const getRiskStyle = (risk: string) => {
    switch (risk) {
      case 'LOW':
        return { color: theme.colors.success, bg: theme.colors.successBg, icon: 'check-circle' as const };
      case 'MEDIUM':
        return { color: theme.colors.warning, bg: theme.colors.warningBg, icon: 'alert-triangle' as const };
      case 'HIGH':
        return { color: theme.colors.danger, bg: theme.colors.dangerBg, icon: 'alert-octagon' as const };
      default:
        return { color: theme.colors.textSecondary, bg: theme.colors.surfaceLight, icon: 'help-circle' as const };
    }
  };

  const statusStyle = getStatusStyle(shipment.status);
  const riskStyle = getRiskStyle(shipment.riskLevel);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        pressed && styles.cardPressed
      ]}
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.shipmentId}>{shipment.id}</Text>
          <Text style={styles.shipmentType}>{shipment.type}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
          <Text style={[styles.statusText, { color: statusStyle.color }]}>
            {formatStatus(shipment.status)}
          </Text>
        </View>
      </View>

      <View style={styles.routeContainer}>
        <Feather name="box" size={14} color={theme.colors.textSecondary} style={styles.routeIcon} />
        <Text style={styles.routeText}>{shipment.origin}</Text>
        <Feather name="arrow-right" size={12} color={theme.colors.textMuted} style={styles.arrowIcon} />
        <Text style={styles.routeText}>{shipment.destination}</Text>
      </View>

      <View style={styles.separator} />

      <View style={styles.footer}>
        <View style={styles.integritySection}>
          <Text style={styles.label}>Integrity</Text>
          <IntegrityScore score={shipment.integrityScore} />
        </View>

        <View style={[styles.riskBadge, { backgroundColor: riskStyle.bg, borderColor: riskStyle.color + '30' }]}>
          <Feather name={riskStyle.icon} size={12} color={riskStyle.color} style={styles.riskIcon} />
          <Text style={[styles.riskText, { color: riskStyle.color }]}>
            {shipment.riskLevel} RISK
          </Text>
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderWidth: 1,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  cardPressed: {
    opacity: 0.9,
    backgroundColor: theme.colors.surfaceLight,
    borderColor: theme.colors.borderLight,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.sm,
  },
  shipmentId: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text,
  },
  shipmentType: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs / 2,
    borderRadius: theme.borderRadius.round,
  },
  statusText: {
    fontSize: theme.typography.sizes.xs - 1,
    fontWeight: theme.typography.weights.bold,
    letterSpacing: 0.5,
  },
  routeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: theme.spacing.sm,
    backgroundColor: theme.colors.surfaceLight,
    paddingVertical: theme.spacing.sm - 2,
    paddingHorizontal: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
  },
  routeIcon: {
    marginRight: theme.spacing.xs,
  },
  routeText: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text,
    fontWeight: theme.typography.weights.medium,
  },
  arrowIcon: {
    marginHorizontal: theme.spacing.sm,
  },
  separator: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginVertical: theme.spacing.sm - 2,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: theme.spacing.xs,
  },
  integritySection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textSecondary,
    marginRight: theme.spacing.sm,
  },
  riskBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.sm - 2,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.xs,
    borderWidth: 1,
  },
  riskIcon: {
    marginRight: theme.spacing.xs,
  },
  riskText: {
    fontSize: theme.typography.sizes.xs - 1,
    fontWeight: theme.typography.weights.bold,
    letterSpacing: 0.5,
  },
});
