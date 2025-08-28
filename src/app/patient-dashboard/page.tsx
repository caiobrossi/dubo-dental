"use client";

import React from "react";
import { Avatar } from "@/ui/components/Avatar";
import { Badge } from "@/ui/components/Badge";
import { Button } from "@/ui/components/Button";
import { DropdownMenu } from "@/ui/components/DropdownMenu";
import { IconButton } from "@/ui/components/IconButton";
import { IconWithBackground } from "@/ui/components/IconWithBackground";
import { Tooltip } from "@/ui/components/Tooltip";
import { FeatherArrowLeft } from "@subframe/core";
import { FeatherPlus } from "@subframe/core";
import { FeatherEdit2 } from "@subframe/core";
import { FeatherTrash } from "@subframe/core";
import * as SubframeCore from "@subframe/core";
import { FeatherChevronDown } from "@subframe/core";
import { FeatherInfo } from "@subframe/core";
import { FeatherTrendingUp } from "@subframe/core";
import { FeatherTrendingDown } from "@subframe/core";
import { FeatherArrowUpRight } from "@subframe/core";
import { FeatherGlobe } from "@subframe/core";
import { FeatherUsers } from "@subframe/core";
import { FeatherInstagram } from "@subframe/core";
import { FeatherUser } from "@subframe/core";

function PatientDashboard() {
  return (
    <div className="flex h-full w-full flex-col items-center bg-page-bg pb-12">
      <div className='flex w-full grow shrink-0 basis-0 flex-col items-start gap-4 px-4 py-4 <div class="w-full max-w-[2000px] mx-auto px-4">'>
        <div className="flex w-full items-center justify-between pt-2 pb-6">
          <div className="flex items-start gap-6">
            <IconButton
              disabled={false}
              variant="neutral-secondary"
              size="medium"
              icon={<FeatherArrowLeft />}
              loading={false}
              onClick={(event: React.MouseEvent<HTMLButtonElement>) => {}}
            />
            <div className="flex items-start gap-4">
              <Avatar image="https://res.cloudinary.com/subframe/image/upload/v1711417510/shared/esj02idt9sf1mhn7xuw8.png">
                A
              </Avatar>
              <div className="flex flex-col items-start gap-2">
                <span className="text-heading-2 font-heading-2 text-default-font">
                  Patients Dashboard
                </span>
                <span className="text-body-medium font-body-medium text-default-font">
                  Monitor patient growth, attendance, and treatment progress to
                  improve care and retention.
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-body-medium font-body-medium text-subtext-color">
              Period: 
            </span>
            <SubframeCore.DropdownMenu.Root>
              <SubframeCore.DropdownMenu.Trigger asChild={true}>
                <Button
                  variant="neutral-tertiary"
                  size="large"
                  iconRight={<FeatherChevronDown />}
                  onClick={(event: React.MouseEvent<HTMLButtonElement>) => {}}
                >
                  March 2025
                </Button>
              </SubframeCore.DropdownMenu.Trigger>
              <SubframeCore.DropdownMenu.Portal>
                <SubframeCore.DropdownMenu.Content
                  side="bottom"
                  align="start"
                  sideOffset={4}
                  asChild={true}
                >
                  <DropdownMenu>
                    <DropdownMenu.DropdownItem>
                      Favorite
                    </DropdownMenu.DropdownItem>
                    <DropdownMenu.DropdownItem icon={<FeatherPlus />}>
                      Add
                    </DropdownMenu.DropdownItem>
                    <DropdownMenu.DropdownItem icon={<FeatherEdit2 />}>
                      Edit
                    </DropdownMenu.DropdownItem>
                    <DropdownMenu.DropdownItem icon={<FeatherTrash />}>
                      Delete
                    </DropdownMenu.DropdownItem>
                  </DropdownMenu>
                </SubframeCore.DropdownMenu.Content>
              </SubframeCore.DropdownMenu.Portal>
            </SubframeCore.DropdownMenu.Root>
          </div>
        </div>
        <div className="grid w-full grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="flex flex-col items-start gap-2 rounded-md border border-solid border-neutral-border bg-default-background px-4 py-4">
            <div className="flex w-full items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-body-medium font-body-medium text-subtext-color">
                  New Patients
                </span>
                <SubframeCore.Tooltip.Provider>
                  <SubframeCore.Tooltip.Root>
                    <SubframeCore.Tooltip.Trigger asChild={true}>
                      <FeatherInfo className="text-body-medium font-body-medium text-default-font" />
                    </SubframeCore.Tooltip.Trigger>
                    <SubframeCore.Tooltip.Portal>
                      <SubframeCore.Tooltip.Content
                        side="top"
                        align="center"
                        sideOffset={4}
                        asChild={true}
                      >
                        <Tooltip>
                          Patients registered in the current period.
                        </Tooltip>
                      </SubframeCore.Tooltip.Content>
                    </SubframeCore.Tooltip.Portal>
                  </SubframeCore.Tooltip.Root>
                </SubframeCore.Tooltip.Provider>
              </div>
              <IconWithBackground
                variant="success"
                size="small"
                icon={<FeatherTrendingUp />}
              />
            </div>
            <span className="text-heading-1 font-heading-1 text-default-font">
              127
            </span>
            <span className="text-body-small font-body-small text-success-600">
              +12.5% vs last month
            </span>
          </div>
          <div className="flex flex-col items-start gap-2 rounded-md border border-solid border-neutral-border bg-default-background px-4 py-4">
            <div className="flex w-full items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-body-medium font-body-medium text-subtext-color">
                  Returning Patients
                </span>
                <SubframeCore.Tooltip.Provider>
                  <SubframeCore.Tooltip.Root>
                    <SubframeCore.Tooltip.Trigger asChild={true}>
                      <FeatherInfo className="text-body-medium font-body-medium text-default-font" />
                    </SubframeCore.Tooltip.Trigger>
                    <SubframeCore.Tooltip.Portal>
                      <SubframeCore.Tooltip.Content
                        side="top"
                        align="center"
                        sideOffset={4}
                        asChild={true}
                      >
                        <Tooltip>
                          Patients that came back for new visits/treatments
                        </Tooltip>
                      </SubframeCore.Tooltip.Content>
                    </SubframeCore.Tooltip.Portal>
                  </SubframeCore.Tooltip.Root>
                </SubframeCore.Tooltip.Provider>
              </div>
              <IconWithBackground
                variant="success"
                size="small"
                icon={<FeatherTrendingUp />}
              />
            </div>
            <span className="text-heading-1 font-heading-1 text-default-font">
              342
            </span>
            <span className="text-body-small font-body-small text-success-600">
              78% retention rate
            </span>
          </div>
          <div className="flex flex-col items-start gap-2 rounded-md border border-solid border-neutral-border bg-default-background px-4 py-4">
            <div className="flex w-full items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-body-medium font-body-medium text-subtext-color">
                  No-show Rate
                </span>
                <SubframeCore.Tooltip.Provider>
                  <SubframeCore.Tooltip.Root>
                    <SubframeCore.Tooltip.Trigger asChild={true}>
                      <FeatherInfo className="text-body-medium font-body-medium text-default-font" />
                    </SubframeCore.Tooltip.Trigger>
                    <SubframeCore.Tooltip.Portal>
                      <SubframeCore.Tooltip.Content
                        side="top"
                        align="center"
                        sideOffset={4}
                        asChild={true}
                      >
                        <Tooltip>
                          Percentage of missed appointments (no cancellation)
                        </Tooltip>
                      </SubframeCore.Tooltip.Content>
                    </SubframeCore.Tooltip.Portal>
                  </SubframeCore.Tooltip.Root>
                </SubframeCore.Tooltip.Provider>
              </div>
              <IconWithBackground
                variant="error"
                size="small"
                icon={<FeatherTrendingDown />}
              />
            </div>
            <span className="text-heading-1 font-heading-1 text-default-font">
              4.2%
            </span>
            <span className="text-body-small font-body-small text-error-600">
              +1.2% vs last month
            </span>
          </div>
          <div className="flex flex-col items-start gap-2 rounded-md border border-solid border-neutral-border bg-default-background px-4 py-4">
            <div className="flex w-full items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-body-medium font-body-medium text-subtext-color">
                  Treatment Conversion
                </span>
                <SubframeCore.Tooltip.Provider>
                  <SubframeCore.Tooltip.Root>
                    <SubframeCore.Tooltip.Trigger asChild={true}>
                      <FeatherInfo className="text-body-medium font-body-medium text-default-font" />
                    </SubframeCore.Tooltip.Trigger>
                    <SubframeCore.Tooltip.Portal>
                      <SubframeCore.Tooltip.Content
                        side="top"
                        align="center"
                        sideOffset={4}
                        asChild={true}
                      >
                        <Tooltip>
                          Consultations that converted into treatments started
                        </Tooltip>
                      </SubframeCore.Tooltip.Content>
                    </SubframeCore.Tooltip.Portal>
                  </SubframeCore.Tooltip.Root>
                </SubframeCore.Tooltip.Provider>
              </div>
              <IconWithBackground
                variant="success"
                size="small"
                icon={<FeatherTrendingUp />}
              />
            </div>
            <span className="text-heading-1 font-heading-1 text-default-font">
              68%
            </span>
            <span className="text-body-small font-body-small text-success-600">
              +5.3% vs last month
            </span>
          </div>
        </div>
        <div className="grid w-full grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="flex flex-col items-start gap-2 rounded-md border border-solid border-neutral-border bg-default-background px-4 py-4">
            <div className="flex w-full items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-body-medium font-body-medium text-subtext-color">
                  Inactive patients
                </span>
                <SubframeCore.Tooltip.Provider>
                  <SubframeCore.Tooltip.Root>
                    <SubframeCore.Tooltip.Trigger asChild={true}>
                      <FeatherInfo className="text-body-medium font-body-medium text-default-font" />
                    </SubframeCore.Tooltip.Trigger>
                    <SubframeCore.Tooltip.Portal>
                      <SubframeCore.Tooltip.Content
                        side="top"
                        align="center"
                        sideOffset={4}
                        asChild={true}
                      >
                        <Tooltip>
                          Patients who haven&apos;t returned in the last 6–12 months
                        </Tooltip>
                      </SubframeCore.Tooltip.Content>
                    </SubframeCore.Tooltip.Portal>
                  </SubframeCore.Tooltip.Root>
                </SubframeCore.Tooltip.Provider>
              </div>
              <IconWithBackground
                variant="success"
                size="small"
                icon={<FeatherTrendingUp />}
              />
            </div>
            <span className="text-heading-1 font-heading-1 text-default-font">
              23
            </span>
            <span className="text-body-small font-body-small text-success-600">
              +12.5% vs last month
            </span>
          </div>
          <div className="flex flex-col items-start gap-2 rounded-md border border-solid border-neutral-border bg-default-background px-4 py-4">
            <div className="flex w-full items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-body-medium font-body-medium text-subtext-color">
                  Insurance vs Private patients
                </span>
                <SubframeCore.Tooltip.Provider>
                  <SubframeCore.Tooltip.Root>
                    <SubframeCore.Tooltip.Trigger asChild={true}>
                      <FeatherInfo className="text-body-medium font-body-medium text-default-font" />
                    </SubframeCore.Tooltip.Trigger>
                    <SubframeCore.Tooltip.Portal>
                      <SubframeCore.Tooltip.Content
                        side="top"
                        align="center"
                        sideOffset={4}
                        asChild={true}
                      >
                        <Tooltip>
                          Patients that came back for new visits/treatments
                        </Tooltip>
                      </SubframeCore.Tooltip.Content>
                    </SubframeCore.Tooltip.Portal>
                  </SubframeCore.Tooltip.Root>
                </SubframeCore.Tooltip.Provider>
              </div>
              <IconWithBackground
                variant="success"
                size="small"
                icon={<FeatherTrendingUp />}
              />
            </div>
            <span className="text-heading-1 font-heading-1 text-default-font">
              23/124
            </span>
            <span className="text-body-small font-body-small text-success-600">
              78% retention rate
            </span>
          </div>
          <div className="flex flex-col items-start gap-2 rounded-md border border-solid border-neutral-border bg-default-background px-4 py-4">
            <div className="flex w-full items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-body-medium font-body-medium text-subtext-color">
                  Peak booking times
                </span>
                <SubframeCore.Tooltip.Provider>
                  <SubframeCore.Tooltip.Root>
                    <SubframeCore.Tooltip.Trigger asChild={true}>
                      <FeatherInfo className="text-body-medium font-body-medium text-default-font" />
                    </SubframeCore.Tooltip.Trigger>
                    <SubframeCore.Tooltip.Portal>
                      <SubframeCore.Tooltip.Content
                        side="top"
                        align="center"
                        sideOffset={4}
                        asChild={true}
                      >
                        <Tooltip>Busiest days/times of the week</Tooltip>
                      </SubframeCore.Tooltip.Content>
                    </SubframeCore.Tooltip.Portal>
                  </SubframeCore.Tooltip.Root>
                </SubframeCore.Tooltip.Provider>
              </div>
              <IconWithBackground
                variant="error"
                size="small"
                icon={<FeatherTrendingDown />}
              />
            </div>
            <span className="text-heading-1 font-heading-1 text-default-font">
              Mondays
            </span>
            <span className="text-body-small font-body-small text-error-600">
              +1.2% vs last month
            </span>
          </div>
          <div className="flex flex-col items-start gap-2 rounded-md border border-solid border-neutral-border bg-default-background px-4 py-4">
            <div className="flex w-full items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-body-medium font-body-medium text-subtext-color">
                  Average Waiting Time
                </span>
                <SubframeCore.Tooltip.Provider>
                  <SubframeCore.Tooltip.Root>
                    <SubframeCore.Tooltip.Trigger asChild={true}>
                      <FeatherInfo className="text-body-medium font-body-medium text-default-font" />
                    </SubframeCore.Tooltip.Trigger>
                    <SubframeCore.Tooltip.Portal>
                      <SubframeCore.Tooltip.Content
                        side="top"
                        align="center"
                        sideOffset={4}
                        asChild={true}
                      >
                        <Tooltip>between booking and consultation</Tooltip>
                      </SubframeCore.Tooltip.Content>
                    </SubframeCore.Tooltip.Portal>
                  </SubframeCore.Tooltip.Root>
                </SubframeCore.Tooltip.Provider>
              </div>
              <IconWithBackground
                variant="success"
                size="small"
                icon={<FeatherTrendingUp />}
              />
            </div>
            <span className="text-heading-1 font-heading-1 text-default-font">
              1 week
            </span>
            <span className="text-body-small font-body-small text-success-600">
              +5.3% vs last month
            </span>
          </div>
        </div>
        <div className="grid w-full grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="flex flex-col items-start gap-4 rounded-md border border-solid border-neutral-border bg-default-background px-4 py-4">
            <div className="flex w-full items-start justify-between">
              <div className="flex flex-col items-start gap-1">
                <span className="text-heading-3 font-heading-3 text-default-font">
                  Patient Growth
                </span>
                <span className="text-body-small font-body-small text-subtext-color">
                  Track monthly new vs returning patients over time
                </span>
              </div>
              <IconButton
                disabled={false}
                variant="neutral-secondary"
                size="large"
                icon={<FeatherArrowUpRight />}
                loading={false}
                onClick={(event: React.MouseEvent<HTMLButtonElement>) => {}}
              />
            </div>
          </div>
          <div className="flex flex-col items-start gap-4 rounded-md border border-solid border-neutral-border bg-default-background px-4 py-4">
            <div className="flex w-full items-start justify-between">
              <div className="flex flex-col items-start gap-1">
                <span className="text-heading-3 font-heading-3 text-default-font">
                  Top 5 treatments
                </span>
                <span className="text-body-small font-body-small text-subtext-color">
                  Most popular procedures chosen by patients.
                </span>
              </div>
              <IconButton
                disabled={false}
                variant="neutral-secondary"
                size="large"
                icon={<FeatherArrowUpRight />}
                loading={false}
                onClick={(event: React.MouseEvent<HTMLButtonElement>) => {}}
              />
            </div>
            <div className="flex w-full grow shrink-0 basis-0 items-center justify-end">
              <div className="flex w-80 flex-none flex-col items-end px-4 py-4">
                <div className="flex h-10 w-full flex-none items-center justify-between border-b border-solid border-neutral-border py-2">
                  <span className="font-body-medium-/-bold text-default-font">
                    Fillings
                  </span>
                  <span className="text-body-medium font-body-medium text-subtext-color">
                    30
                  </span>
                </div>
                <div className="flex h-10 w-full flex-none items-center justify-between border-b border-solid border-neutral-border py-2">
                  <span className="font-body-medium-/-bold text-default-font">
                    Botox
                  </span>
                  <span className="text-body-medium font-body-medium text-subtext-color">
                    25
                  </span>
                </div>
                <div className="flex h-10 w-full flex-none items-center justify-between border-b border-solid border-neutral-border py-2">
                  <span className="font-body-medium-/-bold text-default-font">
                    Orthodontics
                  </span>
                  <span className="text-body-medium font-body-medium text-subtext-color">
                    25
                  </span>
                </div>
                <div className="flex h-10 w-full flex-none items-center justify-between border-b border-solid border-neutral-border py-2">
                  <span className="font-body-medium-/-bold text-default-font">
                    Whitening
                  </span>
                  <span className="text-body-medium font-body-medium text-subtext-color">
                    10
                  </span>
                </div>
                <div className="flex h-10 w-full flex-none items-center justify-between border-b border-solid border-neutral-border py-2">
                  <span className="font-body-medium-/-bold text-default-font">
                    Crown
                  </span>
                  <span className="text-body-medium font-body-medium text-subtext-color">
                    1
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex w-full items-center gap-4">
          <div className="flex grow shrink-0 basis-0 flex-col items-start gap-8 self-stretch rounded-md border border-neutral-border bg-default-background px-4 py-4">
            <div className="flex w-full items-start gap-4">
              <div className="flex grow shrink-0 basis-0 flex-col items-start gap-1">
                <span className="text-heading-3 font-heading-3 text-default-font">
                  Patient Sources
                </span>
                <span className="text-body-small font-body-small text-subtext-color">
                  Where new patients are coming from: referrals, ads, or
                  walk-ins.
                </span>
              </div>
              <IconButton
                disabled={false}
                variant="neutral-secondary"
                size="large"
                icon={<FeatherArrowUpRight />}
                loading={false}
                onClick={(event: React.MouseEvent<HTMLButtonElement>) => {}}
              />
            </div>
            <div className="flex w-full flex-col items-start">
              <div className="flex h-10 w-full flex-none items-center justify-between border-b border-solid border-neutral-border py-2">
                <div className="flex items-center gap-2">
                  <IconWithBackground size="small" icon={<FeatherGlobe />} />
                  <span className="font-body-medium-/-bold text-default-font">
                    Google Ads
                  </span>
                </div>
                <span className="text-body-medium font-body-medium text-default-font">
                  42 patients
                </span>
              </div>
              <div className="flex h-10 w-full flex-none items-center justify-between border-b border-solid border-neutral-border py-2">
                <div className="flex items-center gap-2">
                  <IconWithBackground
                    variant="success"
                    size="small"
                    icon={<FeatherUsers />}
                  />
                  <span className="font-body-medium-/-bold text-default-font">
                    Referrals
                  </span>
                </div>
                <span className="text-body-medium font-body-medium text-default-font">
                  38 patients
                </span>
              </div>
              <div className="flex h-10 w-full flex-none items-center justify-between border-b border-solid border-neutral-border py-2">
                <div className="flex items-center gap-2">
                  <IconWithBackground
                    variant="warning"
                    size="small"
                    icon={<FeatherInstagram />}
                  />
                  <span className="font-body-medium-/-bold text-default-font">
                    Tik-tok
                  </span>
                </div>
                <span className="text-body-medium font-body-medium text-default-font">
                  25 patients
                </span>
              </div>
              <div className="flex h-10 w-full flex-none items-center justify-between border-b border-solid border-neutral-border py-2">
                <div className="flex items-center gap-2">
                  <IconWithBackground
                    variant="warning"
                    size="small"
                    icon={<FeatherInstagram />}
                  />
                  <span className="font-body-medium-/-bold text-default-font">
                    Instagram
                  </span>
                </div>
                <span className="text-body-medium font-body-medium text-default-font">
                  12 patients
                </span>
              </div>
              <div className="flex h-10 w-full flex-none items-center justify-between border-b border-solid border-neutral-border py-2">
                <div className="flex items-center gap-2">
                  <IconWithBackground
                    variant="warning"
                    size="small"
                    icon={<FeatherInstagram />}
                  />
                  <span className="font-body-medium-/-bold text-default-font">
                    Youtube
                  </span>
                </div>
                <span className="text-body-medium font-body-medium text-default-font">
                  02 patients
                </span>
              </div>
              <div className="flex h-10 w-full flex-none items-center justify-between border-b border-solid border-neutral-border py-2">
                <div className="flex items-center gap-2">
                  <IconWithBackground variant="error" size="small" />
                  <span className="font-body-medium-/-bold text-default-font">
                    Walk-in
                  </span>
                </div>
                <span className="text-body-medium font-body-medium text-default-font">
                  18 patients
                </span>
              </div>
              <div className="flex h-10 w-full flex-none items-center justify-between py-2">
                <div className="flex items-center gap-2">
                  <IconWithBackground variant="error" size="small" />
                  <span className="font-body-medium-/-bold text-default-font">
                    Other
                  </span>
                </div>
                <span className="text-body-medium font-body-medium text-default-font">
                  18 patients
                </span>
              </div>
            </div>
          </div>
          <div className="flex grow shrink-0 basis-0 flex-col items-start justify-between self-stretch rounded-md border border-solid border-neutral-border bg-default-background px-4 py-4">
            <div className="flex w-full items-start gap-4">
              <div className="flex grow shrink-0 basis-0 flex-col items-start gap-1">
                <span className="text-heading-3 font-heading-3 text-default-font">
                  Patient referral
                </span>
                <span className="text-body-small font-body-small text-subtext-color">
                  Patients referred by existing patients
                </span>
              </div>
              <IconButton
                disabled={false}
                variant="neutral-secondary"
                size="large"
                icon={<FeatherArrowUpRight />}
                loading={false}
                onClick={(event: React.MouseEvent<HTMLButtonElement>) => {}}
              />
            </div>
            <div className="flex w-full items-center justify-between rounded-md bg-neutral-50 px-4 py-4">
              <span className="text-body-medium font-body-medium text-default-font">
                Total Referrals this month
              </span>
              <div className="flex items-center gap-4">
                <span className="text-heading-4 font-heading-4 text-default-font">
                  23 new people
                </span>
                <span className="text-body-small font-body-small text-success-600">
                  +12.5% vs last month
                </span>
              </div>
            </div>
            <span className="text-heading-4 font-heading-4 text-default-font">
              Top referrers
            </span>
            <div className="flex w-full flex-col items-start">
              <div className="flex w-full items-center gap-4 border-b border-solid border-neutral-border px-2 py-2">
                <span className="w-3 flex-none text-heading-3 font-heading-3 text-default-font">
                  1
                </span>
                <Avatar
                  variant="brand"
                  size="medium"
                  image="https://res.cloudinary.com/subframe/image/upload/v1711417507/shared/fychrij7dzl8wgq2zjq9.avif"
                  square={false}
                >
                  A
                </Avatar>
                <div className="flex grow shrink-0 basis-0 items-center gap-2">
                  <span className="line-clamp-1 grow shrink-0 basis-0 font-body-medium-/-bold text-default-font">
                    Maria Santos
                  </span>
                </div>
                <div className="flex grow shrink-0 basis-0 items-center justify-end gap-1">
                  <FeatherUser className="text-heading-4 font-heading-4 text-subtext-color" />
                  <span className="line-clamp-1 text-body-medium font-body-medium text-subtext-color">
                    12 referrals
                  </span>
                </div>
              </div>
              <div className="flex w-full items-center gap-4 border-b border-solid border-neutral-border px-2 py-2">
                <span className="w-3 flex-none text-heading-3 font-heading-3 text-default-font">
                  2
                </span>
                <Avatar
                  variant="brand"
                  size="medium"
                  image="https://res.cloudinary.com/subframe/image/upload/v1711417512/shared/m0kfajqpwkfief00it4v.jpg"
                  square={false}
                >
                  A
                </Avatar>
                <div className="flex grow shrink-0 basis-0 flex-col items-start gap-1">
                  <span className="line-clamp-1 w-full font-body-medium-/-bold text-default-font">
                    Susan Miller
                  </span>
                  <span className="line-clamp-1 w-full text-body-small text-subtext-color">
                    Employee
                  </span>
                </div>
                <div className="flex grow shrink-0 basis-0 items-center justify-end gap-1">
                  <FeatherUser className="text-heading-4 font-heading-4 text-subtext-color" />
                  <span className="line-clamp-1 text-body-medium font-body-medium text-subtext-color">
                    8 referrals
                  </span>
                </div>
              </div>
              <div className="flex w-full items-center gap-4 px-2 py-2">
                <span className="w-3 flex-none text-heading-3 font-heading-3 text-default-font">
                  3
                </span>
                <Avatar
                  variant="brand"
                  size="medium"
                  image="https://res.cloudinary.com/subframe/image/upload/v1711417512/shared/btvntvzhdbhpulae3kzk.jpg"
                  square={false}
                >
                  A
                </Avatar>
                <div className="flex grow shrink-0 basis-0 flex-col items-start gap-1">
                  <span className="line-clamp-1 w-full font-body-medium-/-bold text-default-font">
                    Caio Brossi
                  </span>
                  <span className="line-clamp-1 w-full text-body-small font-body-small text-subtext-color">
                    Employee
                  </span>
                </div>
                <div className="flex grow shrink-0 basis-0 items-center justify-end gap-1">
                  <FeatherUser className="text-heading-4 font-heading-4 text-subtext-color" />
                  <span className="line-clamp-1 text-body-medium font-body-medium text-subtext-color">
                    3 referrals
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex grow shrink-0 basis-0 flex-col items-start justify-between self-stretch rounded-md border border-solid border-neutral-border bg-default-background px-4 py-4">
            <div className="flex w-full items-start gap-4">
              <div className="flex grow shrink-0 basis-0 flex-col items-start gap-1">
                <span className="text-heading-3 font-heading-3 text-default-font">
                  Cancellations &amp; No-shows
                </span>
                <span className="text-body-small font-body-small text-subtext-color">
                  List of missed or cancelled appointments, including reasons
                </span>
              </div>
              <IconButton
                disabled={false}
                variant="neutral-secondary"
                size="large"
                icon={<FeatherArrowUpRight />}
                loading={false}
                onClick={(event: React.MouseEvent<HTMLButtonElement>) => {}}
              />
            </div>
            <div className="flex w-full flex-col items-start">
              <div className="flex w-full items-center gap-4 border-b border-solid border-neutral-border px-2 py-2">
                <div className="flex grow shrink-0 basis-0 flex-col items-start gap-1">
                  <span className="line-clamp-1 w-full font-body-medium-/-bold text-default-font">
                    Lisa Wang
                  </span>
                  <span className="line-clamp-1 w-full text-body-small font-body-small text-subtext-color">
                    Personal Emergency
                  </span>
                </div>
                <div className="flex grow shrink-0 basis-0 flex-col items-end justify-end gap-1">
                  <Badge
                    variant="error"
                    icon={null}
                    iconRight={null}
                    variant2="default"
                  >
                    No-show
                  </Badge>
                  <span className="line-clamp-1 text-body-medium font-body-medium text-subtext-color">
                    01/03/2024
                  </span>
                </div>
              </div>
              <div className="flex w-full items-center gap-4 border-b border-solid border-neutral-border px-2 py-2">
                <div className="flex grow shrink-0 basis-0 flex-col items-start gap-1">
                  <span className="line-clamp-1 w-full font-body-medium-/-bold text-default-font">
                    Tom Wilson
                  </span>
                  <span className="line-clamp-1 w-full text-body-small font-body-small text-subtext-color">
                    No-show
                  </span>
                </div>
                <div className="flex grow shrink-0 basis-0 flex-col items-end justify-end gap-1">
                  <Badge
                    variant="warning"
                    icon={null}
                    iconRight={null}
                    variant2="default"
                  >
                    Cancelled
                  </Badge>
                  <span className="line-clamp-1 text-body-medium font-body-medium text-subtext-color">
                    10/03/2024
                  </span>
                </div>
              </div>
              <div className="flex w-full items-center gap-4 border-b border-solid border-neutral-border px-2 py-2">
                <div className="flex grow shrink-0 basis-0 flex-col items-start gap-1">
                  <span className="line-clamp-1 w-full font-body-medium-/-bold text-default-font">
                    Anna Garcia
                  </span>
                  <span className="line-clamp-1 w-full text-body-small font-body-small text-subtext-color">
                    Rescheduled
                  </span>
                </div>
                <div className="flex grow shrink-0 basis-0 flex-col items-end justify-end gap-1">
                  <Badge
                    variant="warning"
                    icon={null}
                    iconRight={null}
                    variant2="default"
                  >
                    Cancelled
                  </Badge>
                  <span className="line-clamp-1 text-body-medium font-body-medium text-subtext-color">
                    10/03/2024
                  </span>
                </div>
              </div>
              <div className="flex w-full items-center gap-4 px-2 py-2">
                <div className="flex grow shrink-0 basis-0 flex-col items-start gap-1">
                  <span className="line-clamp-1 w-full font-body-medium-/-bold text-default-font">
                    Stephen Mahadeo
                  </span>
                  <span className="line-clamp-1 w-full text-body-small font-body-small text-subtext-color">
                    Forgot the appointment
                  </span>
                </div>
                <div className="flex grow shrink-0 basis-0 flex-col items-end justify-end gap-1">
                  <Badge
                    variant="error"
                    icon={null}
                    iconRight={null}
                    variant2="default"
                  >
                    No-show
                  </Badge>
                  <span className="line-clamp-1 text-body-medium font-body-medium text-subtext-color">
                    13/03/2024
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex w-full flex-col items-start gap-4 rounded-md border border-neutral-border bg-default-background px-6 py-6">
          <div className="flex w-full flex-col items-start gap-1">
            <span className="text-heading-3 font-heading-3 text-default-font">
              Patients demographics
            </span>
            <span className="text-body-small font-body-small text-subtext-color">
              Patients referred by existing patients
            </span>
          </div>
          <div className="flex w-full grow shrink-0 basis-0 items-start gap-4">
            <div className="flex grow shrink-0 basis-0 flex-col items-start gap-2 self-stretch">
              <div className="flex w-full grow shrink-0 basis-0 flex-col items-start gap-2 px-2 py-2">
                <span className="text-heading-4 font-heading-4 text-default-font">
                  By gender
                </span>
                <div className="flex w-full grow shrink-0 basis-0 items-start rounded-lg bg-neutral-50 px-4 py-4">
                  <div className="flex grow shrink-0 basis-0 flex-col items-center justify-center gap-2 self-stretch border-r border-solid border-neutral-border bg-neutral-50 px-6 py-6">
                    <span className="text-heading-1 font-heading-1 text-default-font">
                      48%
                    </span>
                    <span className="text-body-medium font-body-medium text-default-font">
                      female
                    </span>
                  </div>
                  <div className="flex grow shrink-0 basis-0 flex-col items-center justify-center gap-2 self-stretch bg-neutral-50 px-6 py-6">
                    <span className="text-heading-1 font-heading-1 text-default-font">
                      48%
                    </span>
                    <span className="text-body-medium font-body-medium text-default-font">
                      female
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex w-px flex-none flex-col items-center gap-2 self-stretch bg-neutral-border" />
            <div className="flex grow shrink-0 basis-0 flex-col items-start gap-2 self-stretch">
              <div className="flex w-full grow shrink-0 basis-0 flex-col items-start justify-end gap-2 px-2 py-2">
                <span className="text-heading-4 font-heading-4 text-default-font">
                  By age
                </span>
                <div className="flex w-full grow shrink-0 basis-0 flex-col items-start justify-center rounded-lg bg-neutral-50 px-4 py-4">
                  <div className="flex w-full grow shrink-0 basis-0 items-start justify-center border-b border-solid border-neutral-border">
                    <div className="flex grow shrink-0 basis-0 flex-col items-center justify-center gap-2 self-stretch border-r border-solid border-neutral-border bg-neutral-50 px-6 py-6">
                      <span className="text-heading-1 font-heading-1 text-default-font">
                        12%
                      </span>
                      <span className="text-body-medium font-body-medium text-default-font">
                        0 - 12 yo
                      </span>
                    </div>
                    <div className="flex grow shrink-0 basis-0 flex-col items-center justify-center gap-2 self-stretch border-r border-solid border-neutral-border bg-neutral-50 px-6 py-6">
                      <span className="text-heading-1 font-heading-1 text-default-font">
                        15%
                      </span>
                      <span className="text-body-medium font-body-medium text-default-font">
                        13 -1 9 yo
                      </span>
                    </div>
                    <div className="flex grow shrink-0 basis-0 flex-col items-center justify-center gap-2 self-stretch bg-neutral-50 px-6 py-6">
                      <span className="text-heading-1 font-heading-1 text-default-font">
                        28%
                      </span>
                      <span className="text-body-medium font-body-medium text-default-font">
                        20 - 34 yo
                      </span>
                    </div>
                  </div>
                  <div className="flex w-full grow shrink-0 basis-0 items-start justify-center">
                    <div className="flex grow shrink-0 basis-0 flex-col items-center justify-center gap-2 self-stretch border-r border-solid border-neutral-border bg-neutral-50 px-6 py-6">
                      <span className="text-heading-1 font-heading-1 text-default-font">
                        22%
                      </span>
                      <span className="text-body-medium font-body-medium text-default-font">
                        35 - 49 yo
                      </span>
                    </div>
                    <div className="flex grow shrink-0 basis-0 flex-col items-center justify-center gap-2 self-stretch border-r border-solid border-neutral-border bg-neutral-50 px-6 py-6">
                      <span className="text-heading-1 font-heading-1 text-default-font">
                        13%
                      </span>
                      <span className="text-body-medium font-body-medium text-default-font">
                        50 - 64 yo
                      </span>
                    </div>
                    <div className="flex grow shrink-0 basis-0 flex-col items-center justify-center gap-2 self-stretch bg-neutral-50 px-6 py-6">
                      <span className="text-heading-1 font-heading-1 text-default-font">
                        10%
                      </span>
                      <span className="text-body-medium font-body-medium text-default-font">
                        65+
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex w-px flex-none flex-col items-center gap-2 self-stretch bg-neutral-border" />
            <div className="flex grow shrink-0 basis-0 flex-col items-start gap-2 self-stretch">
              <div className="flex w-full grow shrink-0 basis-0 flex-col items-start gap-2">
                <div className="flex w-full grow shrink-0 basis-0 flex-col items-start justify-end gap-2 px-2 py-2">
                  <span className="text-heading-4 font-heading-4 text-default-font">
                    By Location
                  </span>
                  <div className="flex w-full grow shrink-0 basis-0 flex-col items-start justify-center rounded-lg bg-neutral-50 px-4 py-4">
                    <div className="flex w-full grow shrink-0 basis-0 items-start justify-center">
                      <div className="flex grow shrink-0 basis-0 flex-col items-center justify-center gap-2 self-stretch border-r border-solid border-neutral-border bg-neutral-50 px-6 py-6">
                        <span className="text-heading-1 font-heading-1 text-default-font">
                          55%
                        </span>
                        <span className="text-body-medium font-body-medium text-default-font">
                          Lisbon
                        </span>
                      </div>
                      <div className="flex grow shrink-0 basis-0 flex-col items-center justify-center gap-2 self-stretch border-r border-solid border-neutral-border bg-neutral-50 px-6 py-6">
                        <span className="text-heading-1 font-heading-1 text-default-font">
                          25%
                        </span>
                        <span className="text-body-medium font-body-medium text-default-font">
                          Cascais
                        </span>
                      </div>
                      <div className="flex grow shrink-0 basis-0 flex-col items-center justify-center gap-2 self-stretch bg-neutral-50 px-6 py-6">
                        <span className="text-heading-1 font-heading-1 text-default-font">
                          20%
                        </span>
                        <span className="text-body-medium font-body-medium text-default-font">
                          Other
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PatientDashboard;
