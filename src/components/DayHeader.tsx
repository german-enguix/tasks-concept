import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text, Icon, useTheme, IconButton, Chip } from 'react-native-paper';
import { WorkDay, DayStatus } from '@/types';

interface DayHeaderProps {
  workDay: WorkDay;
  canNavigatePrev: boolean;
  canNavigateNext: boolean;
  onNavigateDay: (direction: 'prev' | 'next' | 'today') => void;
}

export const DayHeader: React.FC<DayHeaderProps> = ({ 
  workDay, 
  canNavigatePrev, 
  canNavigateNext, 
  onNavigateDay 
}) => {
  const theme = useTheme();
  
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };
  
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-ES', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };



  const isToday = workDay.date.toDateString() === new Date().toDateString();
  const isYesterday = workDay.date.toDateString() === new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString();
  const isTomorrow = workDay.date.toDateString() === new Date(Date.now() + 24 * 60 * 60 * 1000).toDateString();
  const isCompleted = workDay.status === DayStatus.COMPLETED;

  return (
    <Card style={styles.container}>
      <Card.Content style={styles.content}>
        {/* Navegación de días */}
        <View style={styles.navigationRow}>
          <IconButton
            icon="chevron-left"
            size={24}
            onPress={() => onNavigateDay('prev')}
            disabled={!canNavigatePrev}
            style={[styles.navButton, !canNavigatePrev && styles.navButtonDisabled]}
          />
          
          <View style={styles.dayInfo}>
            <View style={styles.dayLabelRow}>
              {(isToday || isYesterday || isTomorrow || isCompleted) && (
                <Chip 
                  icon={isToday ? 'calendar-today' : isYesterday ? 'calendar-clock' : isTomorrow ? 'calendar-arrow-right' : 'check-circle'}
                  mode="outlined"
                  style={[styles.dayChip, { 
                    borderColor: isToday ? theme.colors.primary : 
                                isYesterday ? theme.colors.tertiary : 
                                isTomorrow ? theme.colors.secondary : 
                                theme.colors.tertiary 
                  }]}
                  textStyle={{ 
                    color: isToday ? theme.colors.primary : 
                           isYesterday ? theme.colors.tertiary : 
                           isTomorrow ? theme.colors.secondary : 
                           theme.colors.tertiary, 
                    fontSize: 12 
                  }}
                >
                  {isToday ? 'Hoy' : isYesterday ? 'Ayer' : isTomorrow ? 'Mañana' : 'Finalizado'}
                </Chip>
              )}
              
              {isCompleted && (
                <Chip 
                  icon="lock"
                  mode="outlined"
                  style={[styles.readOnlyChip, { borderColor: theme.colors.onSurfaceVariant }]}
                  textStyle={{ color: theme.colors.onSurfaceVariant, fontSize: 11 }}
                >
                  Solo lectura
                </Chip>
              )}
            </View>
            
            <Text variant="headlineSmall" style={styles.dateText}>
              {formatDate(workDay.date)}
            </Text>
          </View>
          
          <IconButton
            icon="chevron-right"
            size={24}
            onPress={() => onNavigateDay('next')}
            disabled={!canNavigateNext}
            style={[styles.navButton, !canNavigateNext && styles.navButtonDisabled]}
          />
        </View>

        {/* Información del sitio - Removido: ahora está en cada tarea */}

        {/* Hora de inicio y fin */}
        <View style={styles.infoRow}>
          <Icon 
            source="clock-outline" 
            size={20} 
            color={theme.colors.onSurfaceVariant} 
          />
          <Text variant="bodyMedium" style={styles.timeText}>
            Inicio: {formatTime(workDay.startTime)}
            {workDay.endTime && ` • Fin: ${formatTime(workDay.endTime)}`}
          </Text>
        </View>

        {/* Proyecto actual - Removido: ahora está en cada tarea */}

        {/* Resumen del día completado */}
        {isCompleted && workDay.summary && (
          <View style={styles.summarySection}>
            <View style={styles.summaryRow}>
              <View style={styles.summaryItem}>
                <Text variant="bodySmall" style={styles.summaryLabel}>Tareas</Text>
                <Text variant="titleMedium" style={styles.summaryValue}>
                  {workDay.summary.totalTasksCompleted}
                </Text>
              </View>
              <View style={styles.summaryItem}>
                <Text variant="bodySmall" style={styles.summaryLabel}>Tiempo</Text>
                <Text variant="titleMedium" style={styles.summaryValue}>
                  {Math.floor(workDay.summary.totalWorkTime / 3600)}h
                </Text>
              </View>
              <View style={styles.summaryItem}>
                <Text variant="bodySmall" style={styles.summaryLabel}>Evidencias</Text>
                <Text variant="titleMedium" style={styles.summaryValue}>
                  {workDay.summary.evidencesSubmitted}
                </Text>
              </View>
            </View>
          </View>
        )}
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 16,
  },
  content: {
    paddingVertical: 16,
  },
  navigationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  navButton: {
    margin: 0,
  },
  navButtonDisabled: {
    opacity: 0.3,
  },
  dayInfo: {
    flex: 1,
    alignItems: 'center',
  },
  dayLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  dayChip: {
    marginRight: 8,
  },
  readOnlyChip: {
    opacity: 0.7,
  },
  dateText: {
    fontWeight: '600',
    textTransform: 'capitalize',
    textAlign: 'center',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  siteText: {
    marginLeft: 12,
    fontWeight: '500',
  },
  timeText: {
    marginLeft: 12,
    opacity: 0.8,
  },
  projectText: {
    marginLeft: 12,
    fontStyle: 'italic',
    opacity: 0.7,
  },
  summarySection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryLabel: {
    opacity: 0.6,
    marginBottom: 4,
  },
  summaryValue: {
    fontWeight: '600',
    color: '#4CAF50',
  },
});

export default DayHeader; 