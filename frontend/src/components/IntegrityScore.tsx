import React from 'react';
  import { StyleSheet, Text, View } from 'react-native';
  import { theme } from '../theme/theme';

  interface IntegrityScoreProps {
    score: number;
  }

  export const IntegrityScore: React.FC<IntegrityScoreProps> = ({ score }) => {
    // Determine rating status and colors
    let scoreColor = theme.colors.success;
    let bgColor = theme.colors.successBg;

    if (score >= 8) {
      scoreColor = theme.colors.success;
      bgColor = theme.colors.successBg;
    } else if (score >= 5) {
      scoreColor = theme.colors.warning;
      bgColor = theme.colors.warningBg;
    } else {
      scoreColor = theme.colors.danger;
      bgColor = theme.colors.dangerBg;
    }

    return (
      <View style={[styles.container, { backgroundColor: bgColor, borderColor: scoreColor }]}>
        <Text style={[styles.scoreValue, { color: scoreColor }]}>
          {score}
          <Text style={[styles.scoreMax, { color: scoreColor + 'aa' }]}> / 10</Text>
        </Text>
      </View>
    );
  };

  const styles = StyleSheet.create({
    container: {
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs / 2,
      borderRadius: theme.borderRadius.sm,
      borderWidth: 1,
      alignSelf: 'flex-start',
      alignItems: 'center',
      justifyContent: 'center',
    },
    scoreValue: {
      fontSize: theme.typography.sizes.sm,
      fontWeight: theme.typography.weights.semibold,
    },
    scoreMax: {
      fontSize: theme.typography.sizes.xs,
      fontWeight: theme.typography.weights.regular,
    },
  });
  
