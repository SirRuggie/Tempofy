import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { Colors, GlassMorphism, Typography } from '../../styles/colors'

export type TabType = 'tasks' | 'movements' | 'tempo' | 'profile'

interface TabNavigatorProps {
  activeTab: TabType
  onTabChange: (tab: TabType) => void
  taskCount?: number
  movementCount?: number
  completedToday?: number
}

export const TabNavigator: React.FC<TabNavigatorProps> = ({
  activeTab,
  onTabChange,
  taskCount = 0,
  movementCount = 0,
  completedToday = 0
}) => {
  const tabs: Array<{
    id: TabType
    label: string
    icon: string
    badge?: number
  }> = [
    {
      id: 'tasks',
      label: 'Tasks',
      icon: '📋',
      badge: taskCount
    },
    {
      id: 'movements',
      label: 'Movements',
      icon: '🎭',
      badge: movementCount
    },
    {
      id: 'tempo',
      label: 'Tempo',
      icon: '🎵'
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: '👤',
      badge: completedToday
    }
  ]

  return (
    <View style={styles.container}>
      <View style={styles.tabBar}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id
          
          return (
            <TouchableOpacity
              key={tab.id}
              style={[
                styles.tab,
                isActive && styles.activeTab
              ]}
              onPress={() => onTabChange(tab.id)}
              activeOpacity={0.7}
            >
              <View style={styles.tabContent}>
                <Text style={[
                  styles.tabIcon,
                  isActive && styles.activeTabIcon
                ]}>
                  {tab.icon}
                </Text>
                
                <Text style={[
                  styles.tabLabel,
                  isActive && styles.activeTabLabel
                ]}>
                  {tab.label}
                </Text>
                
                {tab.badge !== undefined && tab.badge > 0 && (
                  <View style={[
                    styles.badge,
                    tab.id === 'profile' && styles.successBadge
                  ]}>
                    <Text style={styles.badgeText}>
                      {tab.badge > 99 ? '99+' : tab.badge}
                    </Text>
                  </View>
                )}
              </View>
              
              {isActive && (
                <View style={styles.activeIndicator} />
              )}
            </TouchableOpacity>
          )
        })}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.background.primary,
  },
  
  tabBar: {
    ...GlassMorphism.card,
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 0,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderBottomWidth: 0,
  },
  
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    position: 'relative',
  },
  
  activeTab: {
    backgroundColor: Colors.tempo.moderato.primary + '15',
    borderRadius: 12,
  },
  
  tabContent: {
    alignItems: 'center',
    position: 'relative',
  },
  
  tabIcon: {
    fontSize: 22,
    marginBottom: 4,
    opacity: 0.7,
  },
  
  activeTabIcon: {
    opacity: 1,
  },
  
  tabLabel: {
    ...Typography.caption,
    fontSize: 11,
    fontWeight: '600',
    opacity: 0.6,
  },
  
  activeTabLabel: {
    color: Colors.tempo.moderato.primary,
    opacity: 1,
    fontWeight: '700',
  },
  
  badge: {
    position: 'absolute',
    top: -8,
    right: -12,
    backgroundColor: Colors.accent.error,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.background.primary,
  },
  
  successBadge: {
    backgroundColor: Colors.accent.success,
  },
  
  badgeText: {
    ...Typography.caption,
    fontSize: 10,
    fontWeight: 'bold',
    color: Colors.text.primary,
  },
  
  activeIndicator: {
    position: 'absolute',
    top: 0,
    left: '50%',
    marginLeft: -12,
    width: 24,
    height: 3,
    backgroundColor: Colors.tempo.moderato.primary,
    borderRadius: 2,
  },
})