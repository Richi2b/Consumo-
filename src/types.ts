/**
 * NetGuardian AI - TypeScript Type Definitions
 */

export interface AppNetworkUsage {
  id: string;
  name: string;
  packageName: string;
  category: 'social' | 'streaming' | 'system' | 'web' | 'updates';
  avatarColor: string;
  iconName: string;
  currentUsageMB: number;
  backgroundUsageMB: number;
  isBlocked: boolean;
  isRestricted: boolean; // Restricts video/image sizes on this specific app
  hourlyTrendsMB: number[]; // 24 values representing daily activity
}

export type OperatorName = 'UNITEL' | 'MOVICEL' | 'AFRICELL';

export interface MobileBundle {
  id: string;
  operator: OperatorName;
  name: string;
  priceAOA: number;
  volumeMB: number;
  validityDays: number;
  description: string;
}

export interface SimCardState {
  id: string;
  operator: OperatorName;
  phoneNumber: string;
  creditBalanceAOA: number;
  currentDataMB: number;
  totalDataLimitMB: number;
  expiryDateStr: string;
  isActive: boolean;
}

export interface SystemNotification {
  id: string;
  title: string;
  message: string;
  type: 'critical' | 'warning' | 'info' | 'success';
  timestamp: string;
  isRead: boolean;
  appName?: string;
}

export interface EconomySettings {
  dataLimiterActive: boolean;
  dailyMBBudget: number;
  blockBackgroundData: boolean;
  videoQualityLimit: 'low' | 'medium' | 'high' | 'auto';
  nightModeActive: boolean; // Cheap internet scheduled downloads
  autoSleepInactiveTime: boolean;
}

export interface SavingsHistoryPoint {
  dayName: string; // "Seg", "Ter", "Qua", etc.
  actualMB: number;
  savedMB: number;
  costAOA: number;
}

export interface AISuggestion {
  id: string;
  title: string;
  shortDesc: string;
  detailedAnalysis: string;
  category: 'efficiency' | 'cost' | 'leak' | 'alert';
  estimatedSavingsAOA: number;
  estimatedSavingsMB: number;
  actionLabel: string;
  applied: boolean;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}
