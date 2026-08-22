import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Alert } from '../types/shipment';
import { theme } from '../theme/theme';
import { Feather } from '@expo/vector-icons';

interface AlertCardProps {
  alert: Alert;
}

export const AlertCard: React.FC<AlertCardProps> = ({ alert }) => {
  const getRiskStyle = (risk: string) => {
    switch (risk) {
      case 'HIGH':
        return { color: theme.colors.danger, bg: theme.colors.dangerBg, icon: 'alert-octagon' as const };
      case 'MEDIUM':
        return { color: theme.colors.warning, bg: theme.colors.warningBg, icon: 'alert-triangle' as const };
      case 'LOW':
      default:
        return { color: theme.colors.success, bg: theme.colors.successBg, icon: 'info' as const };
    }
  };

  const riskStyle = getRiskStyle(alert.riskLevel);

  return (
    <View style={[styles.card, { borderColor: riskStyle.color + '25' }]}>
      {/* Left accent color strip */}
      <View style={[styles.accentStrip, { backgroundColor: riskStyle.color }]} />

      <View style={styles.body}>
        <View style={styles.header}>
          <View style={[styles.riskBadge, { backgroundColor: riskStyle.bg }]}>
            <Feather name={riskStyle.icon} size={10} color={riskStyle.color} style={styles.riskIcon} />
            <Text style={[styles.riskText, { color: riskStyle.color }]}>
              {alert.riskLevel} RISK ALERT
            </Text>
          </View>
          <Text style={styles.timestamp}>{alert.timestamp}</Text>
        </View>

        <Text style={styles.title}>{alert.title}</Text>
        <Text style={styles.reason}>{alert.reason}</Text>

        <View style={styles.divider} />

        <View style={styles.footer}>
          <View style={styles.metaRow}>
            <Feather name="map-pin" size={12} color={theme.colors.textSecondary} style={styles.metaIcon} />
            <Text style={styles.metaLabel}>Location: </Text>
            <Text style={styles.metaValue}>{alert.location}</Text>
          </View>
          <Text style={styles.typeLabel}>{alert.type.replace('_', ' ')}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  accentStrip: {
    width: 5,
  },
  body: {
    flex: 1,
    padding: theme.spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  riskBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.sm - 2,
    paddingVertical: theme.spacing.xs / 2,
    borderRadius: theme.borderRadius.sm,
  },
  riskIcon: {
    marginRight: theme.spacing.xs - 2,
  },
  riskText: {
    fontSize: theme.typography.sizes.xs - 3,
    fontWeight: theme.typography.weights.bold,
    letterSpacing: 0.5,
  },
  timestamp: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textSecondary,
    fontWeight: theme.typography.weights.medium,
  },
  title: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs - 2,
  },
  reason: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textSecondary,
    lineHeight: 18,
    marginBottom: theme.spacing.xs,
  },
  divider: {
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
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaIcon: {
    marginRight: theme.spacing.xs,
  },
  metaLabel: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textMuted,
  },
  metaValue: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textSecondary,
    fontWeight: theme.typography.weights.semibold,
  },
  typeLabel: {
    fontSize: theme.typography.sizes.xs - 2,
    color: theme.colors.textSecondary,
    fontWeight: theme.typography.weights.bold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
