import React from 'react';
import { StyleSheet, Text, View, Platform } from 'react-native';
import { AuditRecord } from '../types/shipment';
import { IntegrityScore } from './IntegrityScore';
import { theme } from '../theme/theme';
import { Feather } from '@expo/vector-icons';

interface AuditItemProps {
  record: AuditRecord;
}

export const AuditItem: React.FC<AuditItemProps> = ({ record }) => {
  const getRiskStyle = (risk: string) => {
    switch (risk) {
      case 'HIGH':
        return { color: theme.colors.danger, bg: theme.colors.dangerBg };
      case 'MEDIUM':
        return { color: theme.colors.warning, bg: theme.colors.warningBg };
      case 'LOW':
      default:
        return { color: theme.colors.success, bg: theme.colors.successBg };
    }
  };

  const riskStyle = getRiskStyle(record.riskLevel);

  return (
    <View style={styles.card}>
      {/* Header bar */}
      <View style={styles.header}>
        <View style={styles.stamp}>
          <Feather name="check-circle" size={10} color={theme.colors.success} style={styles.stampIcon} />
          <Text style={styles.verifiedText}>Verified On-Chain</Text>
        </View>
        <Text style={styles.timestamp}>{record.timestamp}</Text>
      </View>

      <Text style={styles.title}>Integrity Check</Text>
      <Text style={styles.reason}>{record.reason}</Text>

      {/* Parameters check */}
      <View style={styles.metaRow}>
        <View style={styles.metaCol}>
          <Text style={styles.metaLabel}>Integrity Score</Text>
          <IntegrityScore score={record.score} />
        </View>
        <View style={styles.metaCol}>
          <Text style={styles.metaLabel}>Risk Rating</Text>
          <View style={[styles.riskBadge, { backgroundColor: riskStyle.bg, borderColor: riskStyle.color + '25' }]}>
            <Text style={[styles.riskText, { color: riskStyle.color }]}>
              {record.riskLevel}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.divider} />

      {/* Transaction Details */}
      <View style={styles.txRow}>
        <Feather name="cpu" size={14} color={theme.colors.textSecondary} style={styles.txIcon} />
        <View style={styles.txContainer}>
          <Text style={styles.txLabel}>Transaction Hash</Text>
          <Text style={styles.txHash} numberOfLines={1} ellipsizeMode="middle">
            {record.transactionHash}
          </Text>
        </View>
      </View>
    </View>
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
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  stamp: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.successBg,
    paddingHorizontal: theme.spacing.sm - 2,
    paddingVertical: theme.spacing.xs / 2,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: theme.colors.success + '20',
  },
  stampIcon: {
    marginRight: theme.spacing.xs - 2,
  },
  verifiedText: {
    fontSize: theme.typography.sizes.xs - 3,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.success,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
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
    marginBottom: theme.spacing.md,
  },
  metaRow: {
    flexDirection: 'row',
    marginBottom: theme.spacing.sm,
  },
  metaCol: {
    flex: 1,
  },
  metaLabel: {
    fontSize: theme.typography.sizes.xs - 1,
    color: theme.colors.textMuted,
    fontWeight: theme.typography.weights.medium,
    marginBottom: theme.spacing.xs,
  },
  riskBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs / 2,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1,
  },
  riskText: {
    fontSize: theme.typography.sizes.xs - 1,
    fontWeight: theme.typography.weights.bold,
    letterSpacing: 0.5,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginVertical: theme.spacing.sm - 2,
  },
  txRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing.xs,
  },
  txIcon: {
    marginRight: theme.spacing.sm,
  },
  txContainer: {
    flex: 1,
  },
  txLabel: {
    fontSize: theme.typography.sizes.xs - 2,
    color: theme.colors.textMuted,
    fontWeight: theme.typography.weights.medium,
    marginBottom: 2,
  },
  txHash: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.primaryLight,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    letterSpacing: 0.2,
  },
});
