import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Shipment } from '../types/shipment';
import { api } from '../services/api';
import { IntegrityScore } from '../components/IntegrityScore';
import { theme } from '../theme/theme';
import { Feather } from '@expo/vector-icons';

export const ShipmentDetailsScreen: React.FC = () => {
  const route = useRoute<RouteProp<RootStackParamList, 'ShipmentDetails'>>();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { shipmentId } = route.params;

  const [shipment, setShipment] = useState<Shipment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await api.getShipment(shipmentId);
        if (data) {
          setShipment(data);
        } else {
          setError('Shipment record not found');
        }
      } catch (err) {
        setError('Error fetching shipment details');
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [shipmentId]);

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'DELIVERED':
        return { backgroundColor: theme.colors.successBg };
      case 'IN_TRANSIT':
        return { backgroundColor: 'rgba(59, 130, 246, 0.15)' };
      case 'DELAYED':
        return { backgroundColor: theme.colors.warningBg };
      default:
        return { backgroundColor: theme.colors.surfaceLight };
    }
  };

  const getStatusTextStyle = (status: string) => {
    switch (status) {
      case 'DELIVERED':
        return { color: theme.colors.success };
      case 'IN_TRANSIT':
        return { color: theme.colors.primaryLight };
      case 'DELAYED':
        return { color: theme.colors.warning };
      default:
        return { color: theme.colors.textSecondary };
    }
  };

  const getRiskLevelStyle = (risk: string) => {
    switch (risk) {
      case 'HIGH':
        return { backgroundColor: theme.colors.dangerBg, borderColor: theme.colors.danger + '25' };
      case 'MEDIUM':
        return { backgroundColor: theme.colors.warningBg, borderColor: theme.colors.warning + '25' };
      case 'LOW':
      default:
        return { backgroundColor: theme.colors.successBg, borderColor: theme.colors.success + '25' };
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'HIGH':
        return theme.colors.danger;
      case 'MEDIUM':
        return theme.colors.warning;
      case 'LOW':
      default:
        return theme.colors.success;
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={theme.colors.primaryLight} />
          <Text style={styles.loadingText}>Loading tracking logs...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !shipment) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Feather name="arrow-left" size={20} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Error</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.centered}>
          <Feather name="alert-triangle" size={48} color={theme.colors.danger} />
          <Text style={styles.errorText}>{error || 'Unknown Error'}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => navigation.goBack()}>
            <Text style={styles.retryButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const isHighRisk = shipment.riskLevel === 'HIGH';

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header bar */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Feather name="arrow-left" size={20} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Shipment Details</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Anomaly Alarm Banner */}
        {isHighRisk && (
          <View style={styles.anomalyBanner}>
            <Feather name="alert-octagon" size={20} color={theme.colors.danger} style={styles.anomalyIcon} />
            <View style={styles.anomalyTextContainer}>
              <Text style={styles.anomalyTitle}>Anomaly Detected</Text>
              <Text style={styles.anomalySubtitle}>Shipment integrity metrics compromised. Action required.</Text>
            </View>
          </View>
        )}

        {/* Card Header Info */}
        <View style={styles.cardHeader}>
          <View style={styles.idRow}>
            <Text style={styles.shipmentId}>{shipment.id}</Text>
            <View style={[styles.statusBadge, getStatusStyle(shipment.status)]}>
              <Text style={[styles.statusText, getStatusTextStyle(shipment.status)]}>
                {shipment.status.replace('_', ' ')}
              </Text>
            </View>
          </View>
          <Text style={styles.shipmentType}>{shipment.type}</Text>
        </View>

        {/* Integrity Rating Box */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionLabel}>Integrity Score</Text>
          <View style={styles.scoreRow}>
            <IntegrityScore score={shipment.integrityScore} />
            <View style={[styles.riskLevelBadge, getRiskLevelStyle(shipment.riskLevel)]}>
              <Feather
                name={isHighRisk ? 'alert-octagon' : shipment.riskLevel === 'MEDIUM' ? 'alert-triangle' : 'check-circle'}
                size={12}
                color={getRiskColor(shipment.riskLevel)}
                style={styles.riskLevelIcon}
              />
              <Text style={[styles.riskLevelText, { color: getRiskColor(shipment.riskLevel) }]}>
                {shipment.riskLevel} RISK
              </Text>
            </View>
          </View>
        </View>

        {/* Geolocation Logistics Route Tracking */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionLabel}>Tracking Logistics</Text>

          <View style={styles.metaInfoRow}>
            <Feather name="map-pin" size={16} color={theme.colors.primaryLight} style={styles.metaInfoIcon} />
            <View>
              <Text style={styles.metaInfoLabel}>Current Location</Text>
              <Text style={styles.metaInfoValue}>{shipment.currentLocation}</Text>
            </View>
          </View>

          <View style={styles.verticalLine} />

          <View style={styles.metaInfoRow}>
            <Feather name="navigation" size={16} color={theme.colors.textSecondary} style={styles.metaInfoIcon} />
            <View>
              <Text style={styles.metaInfoLabel}>Destination</Text>
              <Text style={styles.metaInfoValue}>{shipment.destination}</Text>
            </View>
          </View>

          <View style={styles.verticalLine} />

          <View style={styles.metaInfoRow}>
            <Feather name="clock" size={16} color={theme.colors.textSecondary} style={styles.metaInfoIcon} />
            <View>
              <Text style={styles.metaInfoLabel}>Last Updated</Text>
              <Text style={styles.metaInfoValue}>{shipment.lastUpdated}</Text>
            </View>
          </View>
        </View>

        {/* Action Button Navigation */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[styles.actionBtn, { borderColor: theme.colors.border }]}
            onPress={() => navigation.navigate('Alerts', { shipmentId: shipment.id })}
          >
            <View style={styles.actionBtnLeft}>
              <Feather
                name="bell"
                size={18}
                color={isHighRisk ? theme.colors.danger : theme.colors.textSecondary}
                style={styles.actionBtnIcon}
              />
              <Text style={styles.actionBtnText}>View Alerts</Text>
            </View>
            <View style={styles.actionBtnRight}>
              {isHighRisk && (
                <View style={styles.alertCountBadge}>
                  <Text style={styles.alertCountText}>2</Text>
                </View>
              )}
              <Feather name="chevron-right" size={16} color={theme.colors.textSecondary} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBtn, { borderColor: theme.colors.border, marginTop: theme.spacing.sm }]}
            onPress={() => navigation.navigate('Audit', { shipmentId: shipment.id })}
          >
            <View style={styles.actionBtnLeft}>
              <Feather name="cpu" size={18} color={theme.colors.success} style={styles.actionBtnIcon} />
              <Text style={styles.actionBtnText}>Blockchain Audit</Text>
            </View>
            <Feather name="chevron-right" size={16} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
  },
  loadingText: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.sizes.sm,
    marginTop: theme.spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  backButton: {
    padding: theme.spacing.sm - 2,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  headerTitle: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text,
  },
  scrollContainer: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    paddingBottom: theme.spacing.xl,
  },
  anomalyBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: theme.colors.dangerBg,
    borderColor: theme.colors.danger + '40',
    borderWidth: 1,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  anomalyIcon: {
    marginRight: theme.spacing.sm,
    marginTop: 2,
  },
  anomalyTextContainer: {
    flex: 1,
  },
  anomalyTitle: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.danger,
  },
  anomalySubtitle: {
    fontSize: theme.typography.sizes.sm - 1,
    color: theme.colors.textSecondary,
    lineHeight: 16,
    marginTop: 2,
  },
  cardHeader: {
    marginBottom: theme.spacing.md,
    paddingHorizontal: theme.spacing.xs,
  },
  idRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  shipmentId: {
    fontSize: theme.typography.sizes.xxl,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text,
  },
  statusBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs / 2,
    borderRadius: theme.borderRadius.round,
  },
  statusText: {
    fontSize: theme.typography.sizes.xs - 2,
    fontWeight: theme.typography.weights.bold,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  shipmentType: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  sectionCard: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderWidth: 1,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  sectionLabel: {
    fontSize: theme.typography.sizes.xs - 2,
    color: theme.colors.textMuted,
    fontWeight: theme.typography.weights.bold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: theme.spacing.sm,
  },
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  riskLevelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1,
  },
  riskLevelIcon: {
    marginRight: theme.spacing.xs,
  },
  riskLevelText: {
    fontSize: theme.typography.sizes.xs - 2,
    fontWeight: theme.typography.weights.bold,
    letterSpacing: 0.5,
  },
  metaInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaInfoIcon: {
    marginRight: theme.spacing.md,
    width: 20,
    alignItems: 'center',
  },
  metaInfoLabel: {
    fontSize: theme.typography.sizes.xs - 2,
    color: theme.colors.textMuted,
    fontWeight: theme.typography.weights.medium,
  },
  metaInfoValue: {
    fontSize: theme.typography.sizes.md - 1,
    color: theme.colors.text,
    fontWeight: theme.typography.weights.bold,
    marginTop: 2,
  },
  verticalLine: {
    width: 1,
    height: 14,
    backgroundColor: theme.colors.border,
    marginLeft: 23,
    marginVertical: 4,
  },
  actionsContainer: {
    marginTop: theme.spacing.md,
  },
  actionBtn: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
  },
  actionBtnLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionBtnIcon: {
    marginRight: theme.spacing.sm,
  },
  actionBtnText: {
    fontSize: theme.typography.sizes.md - 1,
    color: theme.colors.text,
    fontWeight: theme.typography.weights.semibold,
  },
  actionBtnRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  alertCountBadge: {
    backgroundColor: theme.colors.danger,
    borderRadius: theme.borderRadius.round,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginRight: theme.spacing.xs,
  },
  alertCountText: {
    color: '#ffffff',
    fontSize: theme.typography.sizes.xs - 3,
    fontWeight: theme.typography.weights.bold,
  },
  errorText: {
    color: theme.colors.danger,
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.semibold,
    textAlign: 'center',
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  retryButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
  },
  retryButtonText: {
    color: '#ffffff',
    fontWeight: theme.typography.weights.semibold,
    fontSize: theme.typography.sizes.sm,
  },
});
