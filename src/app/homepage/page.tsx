"use client";

import React from "react";
import * as SubframeCore from "@subframe/core";
import { Button } from "@/ui/components/Button";
import { CalendarHomepage } from "@/ui/components/CalendarHomepage";
import { DropdownMenu } from "@/ui/components/DropdownMenu";
import { IconButton } from "@/ui/components/IconButton";
import { SchedulingCardDetails } from "@/ui/components/SchedulingCardDetails";
import { SegmentControl } from "@/ui/components/SegmentControl";
import { Select } from "@/ui/components/Select";
import { TaskCard } from "@/ui/components/TaskCard";
import { DefaultPageLayout } from "@/ui/layouts/DefaultPageLayout";
import {
  FeatherPlus,
  FeatherMoreHorizontal,
  FeatherChevronDown,
  FeatherCheckCircle,
  FeatherClock,
  FeatherAlertCircle,
  FeatherCalendar,
  FeatherUsers,
  FeatherFileText,
  FeatherChevronLeft,
  FeatherChevronRight,
  FeatherEdit3,
  FeatherDownload,
} from "@subframe/core";

function Task() {
  return (
    <DefaultPageLayout>
      <div className="container max-w-none flex h-full w-full flex-col items-start gap-6 bg-default-background px-6 py-6">
        <div className="flex w-full items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-heading-2 font-heading-2 text-default-font">
              Tasks
            </span>
            <div className="flex h-6 w-6 flex-col items-center justify-center gap-2 rounded-full bg-brand-100">
              <span className="text-caption-bold font-caption-bold text-brand-700">
                3
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <SegmentControl>
              <SegmentControl.Item active={true}>All</SegmentControl.Item>
              <SegmentControl.Item active={false}>
                Pending
              </SegmentControl.Item>
              <SegmentControl.Item active={false}>
                Completed
              </SegmentControl.Item>
            </SegmentControl>
            <Select placeholder="Filter by">
              <Select.Item value="priority">Priority</Select.Item>
              <Select.Item value="date">Date</Select.Item>
              <Select.Item value="status">Status</Select.Item>
            </Select>
            <SubframeCore.DropdownMenu.Root>
              <SubframeCore.DropdownMenu.Trigger asChild={true}>
                <IconButton
                  variant="neutral-tertiary"
                  size="medium"
                  icon={<FeatherMoreHorizontal />}
                />
              </SubframeCore.DropdownMenu.Trigger>
              <SubframeCore.DropdownMenu.Portal>
                <SubframeCore.DropdownMenu.Content side="bottom" align="end">
                  <DropdownMenu>
                    <DropdownMenu.DropdownItem icon={<FeatherPlus />}>
                      Add task
                    </DropdownMenu.DropdownItem>
                    <DropdownMenu.DropdownItem icon={<FeatherEdit3 />}>
                      Edit view
                    </DropdownMenu.DropdownItem>
                    <DropdownMenu.DropdownItem icon={<FeatherDownload />}>
                      Export
                    </DropdownMenu.DropdownItem>
                  </DropdownMenu>
                </SubframeCore.DropdownMenu.Content>
              </SubframeCore.DropdownMenu.Portal>
            </SubframeCore.DropdownMenu.Root>
          </div>
        </div>
        <div className="flex w-full flex-1 items-start gap-6">
          <div className="flex w-full max-w-96 flex-col items-start gap-4">
            <TaskCard
              text="Review patient records"
            />
            <TaskCard
              text="Update treatment plans"
            />
            <TaskCard
              text="Schedule follow-up calls"
            />
          </div>
          <div className="flex w-full flex-1 flex-col items-start gap-6">
            <div className="flex w-full items-start gap-6">
              <div className="flex w-full flex-1 flex-col items-start gap-4 rounded-lg border border-neutral-border bg-default-background px-6 py-6">
                <div className="flex w-full items-center justify-between">
                  <span className="text-heading-3 font-heading-3 text-default-font">
                    Insights
                  </span>
                  <IconButton
                    variant="neutral-tertiary"
                    size="small"
                    icon={<FeatherMoreHorizontal />}
                  />
                </div>
                <div className="flex w-full flex-col items-start gap-4">
                  <div className="flex w-full items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 flex-col items-center justify-center gap-2 rounded bg-success-100">
                        <FeatherCheckCircle className="h-4 w-4 text-success-700" />
                      </div>
                      <div className="flex flex-col items-start">
                        <span className="text-body-bold font-body-bold text-default-font">
                          Tasks Completed
                        </span>
                        <span className="text-caption font-caption text-subtext-color">
                          This week
                        </span>
                      </div>
                    </div>
                    <span className="text-heading-2 font-heading-2 text-default-font">
                      24
                    </span>
                  </div>
                  <div className="flex w-full items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 flex-col items-center justify-center gap-2 rounded bg-warning-100">
                        <FeatherClock className="h-4 w-4 text-warning-700" />
                      </div>
                      <div className="flex flex-col items-start">
                        <span className="text-body-bold font-body-bold text-default-font">
                          Pending Tasks
                        </span>
                        <span className="text-caption font-caption text-subtext-color">
                          Due today
                        </span>
                      </div>
                    </div>
                    <span className="text-heading-2 font-heading-2 text-default-font">
                      8
                    </span>
                  </div>
                  <div className="flex w-full items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 flex-col items-center justify-center gap-2 rounded bg-error-100">
                        <FeatherAlertCircle className="h-4 w-4 text-error-700" />
                      </div>
                      <div className="flex flex-col items-start">
                        <span className="text-body-bold font-body-bold text-default-font">
                          Overdue Tasks
                        </span>
                        <span className="text-caption font-caption text-subtext-color">
                          Requires attention
                        </span>
                      </div>
                    </div>
                    <span className="text-heading-2 font-heading-2 text-default-font">
                      3
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex w-full max-w-80 flex-col items-start gap-4 rounded-lg border border-neutral-border bg-default-background px-6 py-6">
                <div className="flex w-full items-center justify-between">
                  <span className="text-heading-3 font-heading-3 text-default-font">
                    Quick Actions
                  </span>
                </div>
                <div className="flex w-full flex-col items-start gap-2">
                  <Button
                    className="h-auto w-full justify-start"
                    variant="neutral-tertiary"
                    size="medium"
                    icon={<FeatherPlus />}
                  >
                    Add New Task
                  </Button>
                  <Button
                    className="h-auto w-full justify-start"
                    variant="neutral-tertiary"
                    size="medium"
                    icon={<FeatherCalendar />}
                  >
                    Schedule Appointment
                  </Button>
                  <Button
                    className="h-auto w-full justify-start"
                    variant="neutral-tertiary"
                    size="medium"
                    icon={<FeatherUsers />}
                  >
                    Manage Patients
                  </Button>
                  <Button
                    className="h-auto w-full justify-start"
                    variant="neutral-tertiary"
                    size="medium"
                    icon={<FeatherFileText />}
                  >
                    Generate Report
                  </Button>
                </div>
              </div>
            </div>
            <div className="flex w-full flex-1 flex-col items-start gap-4 rounded-lg border border-neutral-border bg-default-background px-6 py-6">
              <div className="flex w-full items-center justify-between">
                <span className="text-heading-3 font-heading-3 text-default-font">
                  Calendar
                </span>
                <div className="flex items-center gap-2">
                  <IconButton
                    variant="neutral-tertiary"
                    size="small"
                    icon={<FeatherChevronLeft />}
                  />
                  <span className="text-body font-body text-default-font">
                    December 2024
                  </span>
                  <IconButton
                    variant="neutral-tertiary"
                    size="small"
                    icon={<FeatherChevronRight />}
                  />
                </div>
              </div>
              <CalendarHomepage className="w-full" />
            </div>
          </div>
        </div>
      </div>
    </DefaultPageLayout>
  );
}

export default Task;