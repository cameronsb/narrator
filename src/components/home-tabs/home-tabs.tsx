'use client'

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'
import { Sparkles, Library, Download } from 'lucide-react'

export type TabId = 'create' | 'library' | 'import'

interface HomeTabsProps {
  activeTab: TabId
  onTabChange: (tab: TabId) => void
  libraryCount: number
}

const tabs: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: 'create', label: 'Create', icon: Sparkles },
  { id: 'library', label: 'Library', icon: Library },
  { id: 'import', label: 'Import', icon: Download },
]

export function HomeTabs({ activeTab, onTabChange, libraryCount }: HomeTabsProps) {
  return (
    <div className="flex justify-center">
      <Tabs value={activeTab} onValueChange={(value) => onTabChange(value as TabId)}>
        <TabsList className="h-auto gap-1 p-1">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const showBadge = tab.id === 'library' && libraryCount > 0

            return (
              <TabsTrigger key={tab.id} value={tab.id} className="relative gap-2 px-4 py-2 text-sm">
                <Icon className="h-4 w-4" />
                {tab.label}
                {showBadge && (
                  <span
                    className={cn(
                      'flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-xs font-semibold',
                      activeTab === tab.id
                        ? 'bg-primary/10 text-primary'
                        : 'bg-muted-foreground/20 text-muted-foreground'
                    )}
                  >
                    {libraryCount}
                  </span>
                )}
              </TabsTrigger>
            )
          })}
        </TabsList>
      </Tabs>
    </div>
  )
}
