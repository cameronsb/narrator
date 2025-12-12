'use client'

import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Settings, Volume2 } from 'lucide-react'
import { useSettings } from '@/lib/hooks/use-settings'

export function SettingsPopover() {
  const { settings, setVolume, setSpeed, setAutoAdvance, setCaptionsEnabled } = useSettings()
  const { volume, speed: playbackSpeed, autoAdvance } = settings.playback
  const { enabled: captionsEnabled } = settings.captions

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="bg-white/10 text-white hover:bg-white/20 hover:text-white"
          aria-label="Open settings"
        >
          <Settings className="h-4 w-4" />
          <span className="ml-2 hidden sm:inline">Settings</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64" side="top" align="center" sideOffset={12}>
        <div className="space-y-4">
          <h4 className="font-medium">Playback Settings</h4>

          {/* Speed control */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm">Speed</Label>
              <span className="text-muted-foreground text-sm">{playbackSpeed.toFixed(1)}x</span>
            </div>
            <Slider
              value={[playbackSpeed]}
              onValueChange={([value]) => setSpeed(value)}
              min={0.5}
              max={2.5}
              step={0.1}
              aria-label="Playback speed"
            />
          </div>

          {/* Volume control */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm">Volume</Label>
              <span className="text-muted-foreground text-sm">{Math.round(volume * 100)}%</span>
            </div>
            <div className="flex items-center gap-2">
              <Volume2 className="text-muted-foreground h-4 w-4 shrink-0" />
              <Slider
                value={[volume]}
                onValueChange={([value]) => setVolume(value)}
                min={0}
                max={1}
                step={0.01}
                aria-label="Volume"
              />
            </div>
          </div>

          {/* Toggles */}
          <div className="space-y-3 border-t pt-4">
            <div className="flex items-center gap-2">
              <Checkbox
                id="settings-captions"
                checked={captionsEnabled}
                onCheckedChange={(checked) => setCaptionsEnabled(checked === true)}
              />
              <Label htmlFor="settings-captions" className="cursor-pointer text-sm">
                Show captions
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="settings-auto-advance"
                checked={autoAdvance}
                onCheckedChange={(checked) => setAutoAdvance(checked === true)}
              />
              <Label htmlFor="settings-auto-advance" className="cursor-pointer text-sm">
                Auto-advance slides
              </Label>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
