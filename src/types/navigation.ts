import { type IconName } from '@/lib/constants/icons'

export interface NavigationItem {
  name: string
  href: string
  icon: IconName
  description: string
}

export interface NavigationGroup {
  title: string
  items: NavigationItem[]
}
