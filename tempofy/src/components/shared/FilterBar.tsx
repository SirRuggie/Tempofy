import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { Tempo, TEMPO_CONFIG } from '../../lib/supabase'
import { Colors, GlassMorphism, Typography } from '../../styles/colors'

export type SortType = 'newest' | 'oldest' | 'priority' | 'time'

interface FilterBarProps {
  filterTempo: Tempo | 'all'
  sortBy: SortType
  onFilterChange: (tempo: Tempo | 'all') => void
  onSortChange: (sort: SortType) => void
  taskCount?: number
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filterTempo,
  sortBy,
  onFilterChange,
  onSortChange,
  taskCount = 0
}) => {
  const filterOptions = [
    { key: 'all', label: 'All Tasks', count: true },
    { key: 'allegro', label: 'Fast', emoji: TEMPO_CONFIG.allegro.emoji },
    { key: 'moderato', label: 'Steady', emoji: TEMPO_CONFIG.moderato.emoji },
    { key: 'adagio', label: 'Calm', emoji: TEMPO_CONFIG.adagio.emoji }
  ]

  const sortOptions = [
    { key: 'newest', label: 'Newest First', icon: '📅' },
    { key: 'priority', label: 'By Priority', icon: '🔥' },
    { key: 'time', label: 'By Duration', icon: '⏱️' }
  ]

  return (
    <View style={styles.container}>
      {/* Filter Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Show:</Text>
        <View style={styles.filterRow}>
          {filterOptions.map((option) => {
            const isActive = filterTempo === option.key
            
            return (
              <TouchableOpacity
                key={option.key}
                style={[
                  styles.filterButton,
                  isActive && styles.activeFilterButton
                ]}
                onPress={() => onFilterChange(option.key as Tempo | 'all')}
                activeOpacity={0.8}
              >
                {option.emoji && (
                  <Text style={styles.filterEmoji}>{option.emoji}</Text>
                )}
                <Text style={[
                  styles.filterText,
                  isActive && styles.activeFilterText
                ]}>
                  {option.label}
                  {option.count && taskCount > 0 && ` (${taskCount})`}
                </Text>
              </TouchableOpacity>
            )
          })}
        </View>
      </View>

      {/* Sort Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Sort:</Text>
        <View style={styles.sortRow}>
          {sortOptions.map((option) => {
            const isActive = sortBy === option.key
            
            return (
              <TouchableOpacity
                key={option.key}
                style={[
                  styles.sortButton,
                  isActive && styles.activeSortButton
                ]}
                onPress={() => onSortChange(option.key as SortType)}
                activeOpacity={0.8}
              >
                <Text style={styles.sortIcon}>{option.icon}</Text>
                <Text style={[
                  styles.sortText,
                  isActive && styles.activeSortText
                ]}>
                  {option.label}
                </Text>
                {isActive && (
                  <Text style={styles.activeIndicator}>↓</Text>
                )}
              </TouchableOpacity>
            )
          })}
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    ...GlassMorphism.card,
    margin: 16,
    marginBottom: 8,
    padding: 16,
    borderRadius: 16,
  },
  
  section: {
    marginBottom: 12,
  },
  
  sectionTitle: {
    ...Typography.caption,
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 8,
    opacity: 0.7,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  
  filterButton: {
    ...GlassMorphism.button,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 16,
    flex: 1,
    marginHorizontal: 2,
    justifyContent: 'center',
    minHeight: 36,
  },
  
  activeFilterButton: {
    backgroundColor: Colors.tempo.moderato.primary + '25',
    borderColor: Colors.tempo.moderato.primary,
  },
  
  filterEmoji: {
    fontSize: 12,
    marginRight: 4,
  },
  
  filterText: {
    ...Typography.caption,
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },
  
  activeFilterText: {
    color: Colors.tempo.moderato.primary,
    fontWeight: '700',
  },
  
  sortRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  
  sortButton: {
    ...GlassMorphism.button,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 12,
    flex: 1,
    marginHorizontal: 2,
    justifyContent: 'center',
    minHeight: 32,
  },
  
  activeSortButton: {
    backgroundColor: Colors.accent.golden + '25',
    borderColor: Colors.accent.golden,
  },
  
  sortIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  
  sortText: {
    ...Typography.caption,
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
  },
  
  activeSortText: {
    color: Colors.accent.golden,
    fontWeight: '700',
  },
  
  activeIndicator: {
    ...Typography.caption,
    fontSize: 10,
    color: Colors.accent.golden,
    marginLeft: 2,
    fontWeight: 'bold',
  },
})