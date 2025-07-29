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
  Stethoscope,
  Hospital,
  HeartPulse,
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
  Stethoscope,
  Hospital,
  HeartPulse,
} as const

export type IconName = keyof typeof ICON_MAP
