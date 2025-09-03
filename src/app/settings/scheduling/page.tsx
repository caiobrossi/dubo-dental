"use client";

import React from "react";
import { Select } from "@/ui/components/Select";
import { Button } from "@/ui/components/Button";
import { useSettings } from "@/contexts/SettingsContext";
import { useTimezones } from "@/hooks/useTimezones";

function SchedulingSettingsPage() {
  const { settings, updateSettings } = useSettings();
  const { timezones, getTimezoneByValue } = useTimezones();

  return (
    <div className="flex grow shrink-0 basis-0 flex-col items-center gap-6 lg:gap-8 self-stretch px-4 lg:px-0 py-4 lg:py-0">
      
      {/* Desktop Title */}
      <div className="hidden lg:flex w-full items-center gap-2">
        <span className="grow shrink-0 basis-0 text-heading-2 font-heading-2 text-default-font">
          Scheduling settings
        </span>
      </div>

      {/* Settings Form */}
      <div className="w-full max-w-full lg:max-w-3xl xl:max-w-4xl space-y-6 lg:space-y-8">
        
        {/* Week starts on */}
        <div className="flex flex-col sm:flex-row w-full items-start sm:items-center justify-between gap-4">
          <div className="flex flex-col items-start gap-1 lg:gap-2 flex-1">
            <span className="font-body-medium-/-bold text-default-font text-sm lg:text-base">
              Week starts on
            </span>
            <span className="text-body-medium font-body-medium text-subtext-color text-xs lg:text-sm">
              Choose which day appears as the first column in your calendar
            </span>
          </div>
          <Select
            className="h-10 w-full sm:w-48 lg:w-56 xl:w-112 flex-none"
            disabled={false}
            error={false}
            variant="outline"
            label=""
            placeholder="Monday"
            helpText=""
            icon={null}
            value={settings.weekStartsOn}
            onValueChange={(value: string) => updateSettings({ weekStartsOn: value as 'Monday' | 'Sunday' | 'Saturday' })}
          >
            <Select.Item value="Monday">Monday</Select.Item>
            <Select.Item value="Sunday">Sunday</Select.Item>
            <Select.Item value="Saturday">Saturday</Select.Item>
          </Select>
        </div>

        {/* Calendar blocks */}
        <div className="flex flex-col sm:flex-row w-full items-start sm:items-center justify-between gap-4">
          <div className="flex flex-col items-start gap-1 lg:gap-2 flex-1">
            <span className="font-body-medium-/-bold text-default-font text-sm lg:text-base">
              Calendar blocks are by default
            </span>
            <span className="text-body-medium font-body-medium text-subtext-color text-xs lg:text-sm">
              Default appointment duration and time slot intervals
            </span>
          </div>
          <Select
            className="h-10 w-full sm:w-48 lg:w-56 xl:w-112 flex-none"
            disabled={false}
            error={false}
            variant="outline"
            label=""
            placeholder="15 min"
            helpText=""
            icon={null}
            value={settings.calendarBlocks.toString()}
            onValueChange={(value: string) => updateSettings({ calendarBlocks: parseInt(value) as 15 | 30 | 60 })}
          >
            <Select.Item value="15">15 min</Select.Item>
            <Select.Item value="30">30 min</Select.Item>
            <Select.Item value="60">60 min</Select.Item>
          </Select>
        </div>

        {/* Timezone */}
        <div className="flex flex-col sm:flex-row w-full items-start sm:items-center justify-between gap-4">
          <div className="flex flex-col items-start gap-1 lg:gap-2 flex-1">
            <span className="font-body-medium-/-bold text-default-font text-sm lg:text-base">
              Timezone
            </span>
            <span className="text-body-medium font-body-medium text-subtext-color text-xs lg:text-sm">
              Set your clinic primary timezone for appointments
            </span>
          </div>
          <Select
            className="h-10 w-full sm:w-48 lg:w-56 xl:w-112 flex-none"
            disabled={false}
            error={false}
            variant="outline"
            label=""
            placeholder="Select timezone"
            helpText=""
            icon={null}
            value={settings.timezone}
            onValueChange={(value: string) => updateSettings({ timezone: value })}
          >
            {timezones.map((tz) => (
              <Select.Item key={tz.value} value={tz.value}>
                {tz.label} - {tz.offset}
              </Select.Item>
            ))}
          </Select>
        </div>

        {/* Save Button - Mobile only */}
        <div className="lg:hidden w-full pt-4">
          <Button 
            variant="brand-primary" 
            size="large"
            className="w-full"
            onClick={() => {}}
          >
            Save Settings
          </Button>
        </div>

      </div>
    </div>
  );
}

export default SchedulingSettingsPage;