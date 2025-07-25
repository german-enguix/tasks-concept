import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Text, Surface, Card, Chip, IconButton, SegmentedButtons, ProgressBar, Icon, ActivityIndicator } from 'react-native-paper';
import { formatDate } from '@/utils';
import { supabaseService } from '@/services/supabaseService';
import { Project, ProjectStatus, ProjectPriority } from '@/types';

interface ProjectsScreenProps {
  onNavigateToProject: (projectId: string) => void;
}

export const ProjectsScreen: React.FC<ProjectsScreenProps> = ({ 
  onNavigateToProject 
}) => {
  const [selectedTab, setSelectedTab] = useState('assigned');
  const [allProjects, setAllProjects] = useState<Project[]>([]);
  const [assignedProjects, setAssignedProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  
  const currentProjects = selectedTab === 'assigned' ? assignedProjects : allProjects;

  useEffect(() => {
    loadCurrentUser();
  }, []);

  useEffect(() => {
    if (currentUserId) {
      loadProjects();
    }
  }, [currentUserId]);

  const loadCurrentUser = async () => {
    try {
      const currentUser = await supabaseService.getCurrentUser();
      if (currentUser) {
        setCurrentUserId(currentUser.id);
        console.log('✅ Current user loaded in projects:', currentUser.id);
      } else {
        console.error('❌ No authenticated user found in projects');
        setCurrentUserId(null);
      }
    } catch (error) {
      console.error('❌ Error loading current user in projects:', error);
      setCurrentUserId(null);
    }
  };

  const loadProjects = async () => {
    if (!currentUserId) {
      console.log('❌ Cannot load projects: no authenticated user');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Cargar todos los proyectos
      const allProjectsData = await supabaseService.getProjects();
      setAllProjects(allProjectsData);
      
      // Cargar proyectos asignados al usuario actual
      const assignedProjectsData = await supabaseService.getProjects(currentUserId);
      setAssignedProjects(assignedProjectsData);
      
      console.log('✅ Projects loaded from Supabase:', {
        total: allProjectsData.length,
        assigned: assignedProjectsData.length
      });
    } catch (err) {
      console.error('❌ Error loading projects:', err);
      setError(err instanceof Error ? err.message : 'Error loading projects');
      // Fallback a arrays vacíos si falla
      setAllProjects([]);
      setAssignedProjects([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: ProjectStatus) => {
    switch (status) {
      case ProjectStatus.PROGRAMMED:
        return '#9E9E9E';
      case ProjectStatus.IN_PROGRESS:
        return '#2196F3';
      case ProjectStatus.COMPLETED:
        return '#4CAF50';
      case ProjectStatus.CANCELLED:
        return '#F44336';
      default:
        return '#9E9E9E';
    }
  };

  const getStatusText = (status: ProjectStatus) => {
    switch (status) {
      case ProjectStatus.PROGRAMMED:
        return 'Programado';
      case ProjectStatus.IN_PROGRESS:
        return 'En progreso';
      case ProjectStatus.COMPLETED:
        return 'Finalizado';
      case ProjectStatus.CANCELLED:
        return 'Cancelado';
      default:
        return 'Desconocido';
    }
  };

  const getPriorityColor = (priority: ProjectPriority) => {
    switch (priority) {
      case ProjectPriority.LOW:
        return '#4CAF50';
      case ProjectPriority.MEDIUM:
        return '#FF9800';
      case ProjectPriority.HIGH:
        return '#F44336';
      case ProjectPriority.CRITICAL:
        return '#9C27B0';
      default:
        return '#9E9E9E';
    }
  };

  const getPriorityText = (priority: ProjectPriority) => {
    switch (priority) {
      case ProjectPriority.LOW:
        return 'Baja';
      case ProjectPriority.MEDIUM:
        return 'Media';
      case ProjectPriority.HIGH:
        return 'Alta';
      case ProjectPriority.CRITICAL:
        return 'Crítica';
      default:
        return 'Sin definir';
    }
  };

  const formatDateRange = (startDate: Date, endDate?: Date) => {
    const start = startDate.toLocaleDateString('es-ES', { 
      day: 'numeric', 
      month: 'short',
      year: 'numeric'
    });
    
    if (!endDate) return `Desde ${start}`;
    
    const end = endDate.toLocaleDateString('es-ES', { 
      day: 'numeric', 
      month: 'short',
      year: 'numeric'
    });
    
    return `${start} - ${end}`;
  };

  const getUnresolvedObservationsCount = (project: Project) => {
    return project.observations.filter(obs => !obs.isResolved).length;
  };

  return (
    <Surface style={styles.container}>
      <ScrollView style={styles.content}>
        {/* Header integrado */}
        <View style={styles.header}>
          <Text variant="headlineMedium">Mis Proyectos</Text>
          <Text variant="bodyMedium">
            {currentProjects.length} proyecto{currentProjects.length !== 1 ? 's' : ''}
          </Text>
        </View>

        {/* Tab Selector */}
        <View style={styles.tabContainer}>
          <SegmentedButtons
            value={selectedTab}
            onValueChange={setSelectedTab}
            buttons={[
              {
                value: 'assigned',
                label: 'Asignados',
                icon: 'account-check',
              },
              {
                value: 'all',
                label: 'Todos',
                icon: 'format-list-bulleted',
              },
            ]}
          />
        </View>

        {/* Loading State */}
        {loading && (
          <Card style={styles.projectCard}>
            <Card.Content style={styles.centerContent}>
              <ActivityIndicator size="large" />
              <Text variant="bodyLarge" style={styles.loadingText}>
                Cargando proyectos...
              </Text>
            </Card.Content>
          </Card>
        )}

        {/* Error State */}
        {error && !loading && (
          <Card style={[styles.projectCard, styles.errorCard]}>
            <Card.Content>
              <Text variant="headlineSmall" style={styles.errorTitle}>
                ❌ Error al cargar proyectos
              </Text>
              <Text variant="bodyMedium" style={styles.errorText}>
                {error}
              </Text>
              <IconButton
                icon="refresh"
                mode="contained"
                onPress={loadProjects}
                style={styles.retryButton}
              >
                Reintentar
              </IconButton>
            </Card.Content>
          </Card>
        )}

        {/* Empty State */}
        {!loading && !error && currentProjects.length === 0 && (
          <Card style={styles.projectCard}>
            <Card.Content style={styles.centerContent}>
              <Icon source="folder-outline" size={64} color="#9E9E9E" />
              <Text variant="titleMedium" style={styles.emptyTitle}>
                No hay proyectos
              </Text>
              <Text variant="bodyMedium" style={styles.emptyText}>
                {selectedTab === 'assigned' 
                  ? 'No tienes proyectos asignados actualmente'
                  : 'No hay proyectos disponibles'
                }
              </Text>
            </Card.Content>
          </Card>
        )}

        {/* Projects List */}
        {!loading && !error && currentProjects.map((project) => (
          <Card 
            key={project.id} 
            style={styles.projectCard}
            onPress={() => onNavigateToProject(project.id)}
          >
            <Card.Content>
              <View style={styles.projectHeader}>
                <View style={styles.projectTitleRow}>
                  <Text variant="titleMedium" numberOfLines={1} style={styles.projectTitle}>
                    {project.name}
                  </Text>
                  <View style={styles.projectChips}>
                    <Chip 
                      mode="outlined" 
                      style={[styles.statusChip, { borderColor: getStatusColor(project.status) }]}
                      textStyle={{ color: getStatusColor(project.status), fontSize: 11 }}
                    >
                      {getStatusText(project.status)}
                    </Chip>
                  </View>
                </View>
                
                <View style={styles.priorityRow}>
                  <Chip 
                    mode="outlined" 
                    style={[styles.priorityChip, { borderColor: getPriorityColor(project.priority) }]}
                    textStyle={{ color: getPriorityColor(project.priority), fontSize: 10 }}
                  >
                    {getPriorityText(project.priority)}
                  </Chip>
                </View>
              </View>
              
              <Text variant="bodySmall" numberOfLines={2} style={styles.projectDescription}>
                {project.description}
              </Text>
              
              <View style={styles.projectDetails}>
                <View style={styles.detailRow}>
                  <View style={styles.detailRowContent}>
                    <Icon source="map-marker" size={16} color="#666" />
                    <Text variant="bodySmall" style={styles.detailLabel}>
                      {project.location}
                    </Text>
                  </View>
                </View>
                
                <View style={styles.detailRow}>
                  <View style={styles.detailRowContent}>
                    <Icon source="calendar" size={16} color="#666" />
                    <Text variant="bodySmall" style={styles.detailLabel}>
                      {formatDateRange(project.startDate, project.endDate)}
                    </Text>
                  </View>
                </View>
                
                <View style={styles.detailRow}>
                  <View style={styles.detailRowContent}>
                    <Icon source="account-group" size={16} color="#666" />
                    <Text variant="bodySmall" style={styles.detailLabel}>
                      {project.assignedTeam.length} miembro{project.assignedTeam.length !== 1 ? 's' : ''}
                    </Text>
                  </View>
                </View>
              </View>
              
              {/* Progress */}
              <View style={styles.progressSection}>
                <View style={styles.progressHeader}>
                  <Text variant="bodySmall" style={styles.progressLabel}>
                    Progreso del proyecto
                  </Text>
                  <Text variant="bodySmall" style={styles.progressValue}>
                    {Math.round(project.completionPercentage)}%
                  </Text>
                </View>
                <ProgressBar 
                  progress={project.completionPercentage / 100} 
                  style={styles.progressBar}
                />
              </View>
              
              {/* Observations Alert */}
              {getUnresolvedObservationsCount(project) > 0 && (
                <View style={styles.observationsAlert}>
                  <View style={styles.alertContent}>
                    <Icon source="alert" size={16} color="#F57C00" />
                    <Text variant="bodySmall" style={styles.observationsText}>
                      {getUnresolvedObservationsCount(project)} observación{getUnresolvedObservationsCount(project) !== 1 ? 'es' : ''} pendiente{getUnresolvedObservationsCount(project) !== 1 ? 's' : ''}
                    </Text>
                  </View>
                </View>
              )}
              
              {/* Tareas completadas */}
              <View style={styles.tasksSection}>
                <Text variant="bodySmall" style={styles.tasksProgress}>
                  {project.completedTasks}/{project.totalTasks} tareas completadas
                </Text>
              </View>
              
              {/* Supervisor */}
              <View style={styles.supervisorInfo}>
                <Text variant="bodySmall" style={styles.supervisorText}>
                  Supervisor: {project.supervisorName}
                </Text>
              </View>
            </Card.Content>
          </Card>
        ))}
        
        {currentProjects.length === 0 && (
          <View style={styles.emptyState}>
            <Text variant="bodyMedium" style={styles.emptyStateText}>
              {selectedTab === 'assigned' 
                ? 'No tienes proyectos asignados' 
                : 'No hay proyectos disponibles'}
            </Text>
          </View>
        )}
        
        {/* Espacio adicional para la navbar */}
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </Surface>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 16,
  },
  tabContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
  },
  content: {
    flex: 1,
  },
  projectCard: {
    marginHorizontal: 16,
    marginBottom: 12,
    elevation: 2,
  },
  projectHeader: {
    marginBottom: 8,
  },
  projectTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  projectTitle: {
    flex: 1,
    marginRight: 8,
    fontWeight: '600',
  },
  projectChips: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusChip: {
    alignSelf: 'flex-start',
  },
  priorityRow: {
    alignItems: 'flex-start',
  },
  priorityChip: {
    alignSelf: 'flex-start',
  },
  projectDescription: {
    marginBottom: 12,
    opacity: 0.7,
    lineHeight: 18,
  },
  projectDetails: {
    marginBottom: 12,
  },
  detailRow: {
    marginBottom: 6,
  },
  detailRowContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailLabel: {
    opacity: 0.8,
    flex: 1,
    marginLeft: 8,
  },
  progressSection: {
    marginBottom: 12,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  progressLabel: {
    fontWeight: '500',
  },
  progressValue: {
    fontWeight: '600',
    color: '#2196F3',
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
  },
  observationsAlert: {
    backgroundColor: 'rgba(255, 152, 0, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#F57C00',
  },
  alertContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  observationsText: {
    color: '#F57C00',
    fontWeight: '500',
    flex: 1,
    marginLeft: 8,
  },
  tasksSection: {
    marginBottom: 12,
  },
  tasksProgress: {
    opacity: 0.7,
    fontSize: 11,
  },
  supervisorInfo: {
    marginBottom: 0,
  },
  supervisorText: {
    opacity: 0.6,
    fontStyle: 'italic',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyStateText: {
    opacity: 0.6,
  },
  bottomSpacer: {
    height: 80, // Espacio para la navbar
  },
  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
  },
  loadingText: {
    marginTop: 16,
    opacity: 0.7,
  },
  errorCard: {
    borderColor: '#F44336',
    borderWidth: 1,
  },
  errorTitle: {
    color: '#F44336',
    marginBottom: 8,
  },
  errorText: {
    marginBottom: 16,
    opacity: 0.7,
  },
  retryButton: {
    alignSelf: 'center',
  },
  emptyTitle: {
    marginTop: 16,
    marginBottom: 8,
    opacity: 0.8,
  },
  emptyText: {
    textAlign: 'center',
    opacity: 0.6,
    paddingHorizontal: 24,
  },
});

export default ProjectsScreen; 