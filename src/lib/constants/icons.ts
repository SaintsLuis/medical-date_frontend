import {
  BarChart3,
  Calendar,
  Users,
  UserCheck,
  Building2,
  CreditCard,
  FileText,
  Pill,
  Settings,
} from 'lucide-react'

export const ICON_MAP = {
  BarChart3,
  Calendar,
  Users,
  UserCheck,
  Building2,
  CreditCard,
  FileText,
  Pill,
  Settings,
} as const

export type IconName = keyof typeof ICON_MAP
