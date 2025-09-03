"use client";

import React from "react";
import { RadioCardGroup } from "@/ui/components/RadioCardGroup";
import { Select } from "@/ui/components/Select";
import { Button } from "@/ui/components/Button";
import { useSettings } from "@/contexts/SettingsContext";

function GeneralSettingsPage() {
  const { settings, updateSettings } = useSettings();

  return (
    <div className="flex grow shrink-0 basis-0 flex-col items-center gap-6 lg:gap-8 self-stretch px-4 lg:px-0 py-4 lg:py-0">
      
      {/* Desktop Title */}
      <div className="hidden lg:flex w-full items-center gap-2">
        <span className="grow shrink-0 basis-0 text-heading-2 font-heading-2 text-default-font">
          General Settings
        </span>
      </div>

      {/* Settings Form */}
      <div className="w-full max-w-full lg:max-w-3xl xl:max-w-4xl space-y-6 lg:space-y-8">
        
        {/* Date format */}
        <div className="flex flex-col sm:flex-row w-full items-start sm:items-center justify-between gap-4">
          <div className="flex flex-col items-start gap-1 lg:gap-2 flex-1">
            <span className="font-body-medium-/-bold text-default-font text-sm lg:text-base">
              Date format
            </span>
            <span className="text-body-medium font-body-medium text-subtext-color text-xs lg:text-sm">
              How dates are displayed throughout the system
            </span>
          </div>
          <Select
            className="h-10 w-full sm:w-48 lg:w-56 xl:w-112 flex-none"
            disabled={false}
            error={false}
            variant="outline"
            label=""
            placeholder="dd/mm/yyyy"
            helpText=""
            icon={null}
            value={settings.dateFormat}
            onValueChange={(value: string) => updateSettings({ dateFormat: value as 'dd/mm/yyyy' | 'mm/dd/yyyy' | 'yyyy-mm-dd' })}
          >
            <Select.Item value="dd/mm/yyyy">dd/mm/yyyy</Select.Item>
            <Select.Item value="mm/dd/yyyy">mm/dd/yyyy</Select.Item>
            <Select.Item value="yyyy-mm-dd">yyyy-mm-dd</Select.Item>
          </Select>
        </div>

        {/* Time format */}
        <div className="flex flex-col sm:flex-row w-full items-start sm:items-center justify-between gap-4">
          <div className="flex flex-col items-start gap-1 lg:gap-2 flex-1">
            <span className="font-body-medium-/-bold text-default-font text-sm lg:text-base">
              Time format
            </span>
            <span className="text-body-medium font-body-medium text-subtext-color text-xs lg:text-sm">
              12-hour or 24-hour time display
            </span>
          </div>
          <RadioCardGroup 
            value={settings.timeFormat} 
            onValueChange={(value: string) => updateSettings({ timeFormat: value as '24hrs' | '12hrs' })}
            className="w-full sm:w-auto"
          >
            <div className="flex flex-col sm:flex-row grow shrink-0 basis-0 items-start gap-2">
              <RadioCardGroup.RadioCard
                className="h-auto w-full sm:w-auto flex-none"
                disabled={false}
                hideRadio={false}
                value="24hrs"
              >
                <div className="flex flex-col items-start pr-2">
                  <span className="w-full text-body-large font-body-large text-default-font">
                    24hrs
                  </span>
                </div>
              </RadioCardGroup.RadioCard>
              <RadioCardGroup.RadioCard
                className="h-auto w-full sm:w-auto flex-none"
                disabled={false}
                hideRadio={false}
                value="12hrs"
              >
                <div className="flex w-full flex-col items-start pr-2">
                  <span className="w-full grow shrink-0 basis-0 text-body-large font-body-large text-default-font">
                    12 am/pm
                  </span>
                </div>
              </RadioCardGroup.RadioCard>
            </div>
          </RadioCardGroup>
        </div>

        {/* Auto logout time */}
        <div className="flex flex-col sm:flex-row w-full items-start sm:items-center justify-between gap-4">
          <div className="flex flex-col items-start gap-1 lg:gap-2 flex-1">
            <span className="font-body-medium-/-bold text-default-font text-sm lg:text-base">
              Auto logout time
            </span>
            <span className="text-body-medium font-body-medium text-subtext-color text-xs lg:text-sm">
              Minutes of inactivity before automatic logout
            </span>
          </div>
          <Select
            className="h-10 w-full sm:w-48 lg:w-56 xl:w-112 flex-none"
            disabled={false}
            error={false}
            variant="outline"
            label=""
            placeholder="30 MIN ( Recommended )"
            helpText=""
            icon={null}
            value={settings.autoLogoutTime === 0 ? 'Never' : settings.autoLogoutTime.toString()}
            onValueChange={(value: string) => updateSettings({ autoLogoutTime: value === 'Never' ? 0 : parseInt(value) as 15 | 30 | 60 })}
          >
            <Select.Item value="15">15 MIN</Select.Item>
            <Select.Item value="30">30 MIN (Recommended)</Select.Item>
            <Select.Item value="60">60 MIN</Select.Item>
            <Select.Item value="Never">Never</Select.Item>
          </Select>
        </div>

        {/* Currency format */}
        <div className="flex flex-col sm:flex-row w-full items-start sm:items-center justify-between gap-4">
          <div className="flex flex-col items-start gap-1 lg:gap-2 flex-1">
            <span className="font-body-medium-/-bold text-default-font text-sm lg:text-base">
              Currency format
            </span>
            <span className="text-body-medium font-body-medium text-subtext-color text-xs lg:text-sm">
              Display prices and billing in your preferred currency
            </span>
          </div>
          <Select
            className="h-10 w-full sm:w-48 lg:w-56 xl:w-112 flex-none"
            disabled={false}
            error={false}
            variant="outline"
            label=""
            placeholder="Euro"
            helpText=""
            icon={null}
            value={settings.currencyFormat}
            onValueChange={(value: string) => updateSettings({ currencyFormat: value as 'EUR' | 'USD' | 'BRL' | 'GBP' })}
          >
            <Select.Item value="EUR">Euro (€)</Select.Item>
            <Select.Item value="USD">US Dollar ($)</Select.Item>
            <Select.Item value="BRL">Brazilian Real (R$)</Select.Item>
            <Select.Item value="GBP">British Pound (£)</Select.Item>
          </Select>
        </div>

        {/* Menu layout */}
        <div className="flex flex-col sm:flex-row w-full items-start sm:items-center justify-between gap-4">
          <div className="flex flex-col items-start gap-1 lg:gap-2 flex-1">
            <span className="font-body-medium-/-bold text-default-font text-sm lg:text-base">
              Menu layout
            </span>
            <span className="text-body-medium font-body-medium text-subtext-color text-xs lg:text-sm">
              Set default navigation layout - compact keeps sidebar collapsed, roomy keeps it expanded
            </span>
          </div>
          <RadioCardGroup 
            value={settings.menuLayout} 
            onValueChange={(value: string) => updateSettings({ menuLayout: value as 'compact' | 'roomy' })}
            className="w-full sm:w-auto"
          >
            <div className="flex flex-col sm:flex-row grow shrink-0 basis-0 items-start gap-2">
              <RadioCardGroup.RadioCard
                className="h-auto w-full sm:w-auto flex-none"
                disabled={false}
                hideRadio={false}
                value="compact"
              >
                <div className="flex flex-col items-start pr-2">
                  <span className="w-full text-body-large font-body-large text-default-font">
                    Compact
                  </span>
                </div>
              </RadioCardGroup.RadioCard>
              <RadioCardGroup.RadioCard
                className="h-auto w-full sm:w-auto flex-none"
                disabled={false}
                hideRadio={false}
                value="roomy"
              >
                <div className="flex w-full flex-col items-start pr-2">
                  <span className="w-full grow shrink-0 basis-0 text-body-large font-body-large text-default-font">
                    Roomy
                  </span>
                </div>
              </RadioCardGroup.RadioCard>
            </div>
          </RadioCardGroup>
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

export default GeneralSettingsPage;