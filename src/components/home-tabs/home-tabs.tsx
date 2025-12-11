'use client'

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
    <div className="flex justify-center" role="tablist" aria-label="Home navigation">
      <div className="bg-muted inline-flex gap-1 rounded-lg p-1">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          const showBadge = tab.id === 'library' && libraryCount > 0

          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              aria-controls={`${tab.id}-panel`}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                'relative flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-all',
                'focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
                isActive
                  ? 'bg-white text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-white/50'
              )}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
              {showBadge && (
                <span
                  className={cn(
                    'flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-xs font-semibold',
                    isActive ? 'bg-primary/10 text-primary' : 'bg-muted-foreground/20 text-muted-foreground'
                  )}
                >
                  {libraryCount}
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
