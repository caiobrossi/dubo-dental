"use client";

import React from "react";
import { Button } from "@/ui/components/Button";
import { CalendarHomepage } from "@/ui/components/CalendarHomepage";
import { DropdownMenu } from "@/ui/components/DropdownMenu";
import { IconButton } from "@/ui/components/IconButton";
import { SchedulingCardDetails } from "@/ui/components/SchedulingCardDetails";
import { SegmentControl } from "@/ui/components/SegmentControl";
import { Select } from "@/ui/components/Select";
import { TaskCard } from "@/ui/components/TaskCard";
import { DefaultPageLayout } from "@/ui/layouts/DefaultPageLayout";
import { FeatherArrowUpRight } from "@subframe/core";
import { FeatherCalendar } from "@subframe/core";
import { FeatherChevronDown } from "@subframe/core";
import { FeatherClock1 } from "@subframe/core";
import { FeatherNutOff } from "@subframe/core";
import { FeatherPlus } from "@subframe/core";
import { FeatherSun } from "@subframe/core";
import { FeatherUser } from "@subframe/core";
import { FeatherUsers } from "@subframe/core";
import * as SubframeCore from "@subframe/core";

function Task() {
  return (
    <DefaultPageLayout>
      <div className="flex h-full w-full flex-col items-start gap-4 pr-3 py-3">
        <div className="flex h-12 w-full flex-none items-center justify-between px-4">
          <div className="flex flex-col items-start gap-1">
            <span className="text-body-medium font-body-medium text-subtext-color">
              Good Morning
            </span>
            <span className="text-heading-3 font-heading-3 text-default-font">
              Kai Brossi
            </span>
          </div>
          <SegmentControl className="h-10 w-auto flex-none" variant="default">
            <SegmentControl.Item active={true}>Tasks</SegmentControl.Item>
            <SegmentControl.Item active={false}>Insights</SegmentControl.Item>
          </SegmentControl>
          <div className="flex flex-col items-end gap-1">
            <span className="text-body-medium font-body-medium text-subtext-color">
              Mon, 3rd Feb
            </span>
            <div className="flex items-end gap-2">
              <FeatherSun className="text-heading-2 font-heading-2 text-neutral-400" />
              <span className="text-heading-3 font-heading-3 text-default-font">
                32 C 
              </span>
              <FeatherClock1 className="text-heading-2 font-heading-2 text-neutral-400" />
              <span className="text-heading-3 font-heading-3 text-default-font">
                05:32 pm
              </span>
            </div>
          </div>
        </div>
        <div className="flex w-full grow shrink-0 basis-0 flex-col items-start gap-2 rounded-lg bg-default-background px-4 py-4 overflow-y-auto">
          <div className="flex w-full items-start justify-center gap-2 pl-8 pr-1 py-6">
            <div className="flex grow shrink-0 basis-0 items-center gap-8 border-r border-solid border-neutral-border px-1 py-1">
              <img
                className="flex-none"
                src="https://res.cloudinary.com/subframe/image/upload/v1752163043/uploads/12900/v9r3qvfj6j3uwih10ssm.svg"
              />
              <div className="flex flex-col items-end gap-4">
                <span className="text-body-medium font-body-medium text-subtext-color">
                  Total tasks
                </span>
                <span className="font-['Urbanist'] text-[60px] font-[300] leading-[36px] text-default-font">
                  23
                </span>
              </div>
            </div>
            <div className="flex grow shrink-0 basis-0 items-center gap-8 border-r border-solid border-neutral-border px-1 py-1">
              <img
                className="flex-none"
                src="https://res.cloudinary.com/subframe/image/upload/v1752163311/uploads/12900/rbf5syfxadggdravzbhl.svg"
              />
              <div className="flex flex-col items-end gap-4">
                <span className="text-body-medium font-body-medium text-subtext-color">
                  Overdue
                </span>
                <span className="font-['Urbanist'] text-[60px] font-[300] leading-[36px] text-default-font">
                  01
                </span>
              </div>
            </div>
            <div className="flex grow shrink-0 basis-0 items-center gap-8 border-r border-solid border-neutral-border px-1 py-1">
              <img
                className="flex-none"
                src="https://res.cloudinary.com/subframe/image/upload/v1752163311/uploads/12900/d4yk09dxvjwtsyg0alnh.svg"
              />
              <div className="flex flex-col items-end gap-4">
                <span className="text-body-medium font-body-medium text-subtext-color">
                  Due soon
                </span>
                <span className="font-['Urbanist'] text-[60px] font-[300] leading-[36px] text-default-font">
                  12
                </span>
              </div>
            </div>
            <div className="flex grow shrink-0 basis-0 items-center gap-8 px-1 py-1">
              <img
                className="flex-none"
                src="https://res.cloudinary.com/subframe/image/upload/v1752163311/uploads/12900/swvvsjwhbufzgnqfe1kb.svg"
              />
              <div className="flex flex-col items-end gap-4">
                <span className="text-body-medium font-body-medium text-subtext-color">
                  Completed tasks
                </span>
                <span className="font-['Urbanist'] text-[60px] font-[300] leading-[36px] text-default-font">
                  23
                </span>
              </div>
            </div>
          </div>
          <div className="flex w-full grow shrink-0 basis-0 items-start gap-2">
            <div className="flex min-w-[576px] grow shrink-0 basis-0 flex-col items-start gap-6 self-stretch rounded-rounded-xlarge border-2 border-solid border-new-white-100 bg-default-background px-4 py-4">
              <div className="flex w-full flex-wrap items-center justify-between">
                <span className="text-heading-2 font-heading-2 text-default-font">
                  Tasks
                </span>
                <div className="flex items-start gap-6">
                  <SubframeCore.DropdownMenu.Root>
                    <SubframeCore.DropdownMenu.Trigger asChild={true}>
                      <Button
                        variant="neutral-tertiary"
                        size="large"
                        iconRight={<FeatherChevronDown />}
                        onClick={(
                          event: React.MouseEvent<HTMLButtonElement>
                        ) => {}}
                      >
                        Assigned to me
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
                          <DropdownMenu.DropdownItem icon={<FeatherUsers />}>
                            Assigned to my team
                          </DropdownMenu.DropdownItem>
                          <DropdownMenu.DropdownItem icon={<FeatherUser />}>
                            Assigned to me
                          </DropdownMenu.DropdownItem>
                          <DropdownMenu.DropdownItem icon={<FeatherNutOff />}>
                            Unassigned
                          </DropdownMenu.DropdownItem>
                        </DropdownMenu>
                      </SubframeCore.DropdownMenu.Content>
                    </SubframeCore.DropdownMenu.Portal>
                  </SubframeCore.DropdownMenu.Root>
                  <SubframeCore.DropdownMenu.Root>
                    <SubframeCore.DropdownMenu.Trigger asChild={true}>
                      <Button
                        variant="neutral-tertiary"
                        size="large"
                        iconRight={<FeatherChevronDown />}
                        onClick={(
                          event: React.MouseEvent<HTMLButtonElement>
                        ) => {}}
                      >
                        Today
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
                          <DropdownMenu.DropdownItem icon={<FeatherCalendar />}>
                            Today
                          </DropdownMenu.DropdownItem>
                          <DropdownMenu.DropdownItem icon={<FeatherCalendar />}>
                            Tomorrow
                          </DropdownMenu.DropdownItem>
                          <DropdownMenu.DropdownItem icon={<FeatherCalendar />}>
                            This week
                          </DropdownMenu.DropdownItem>
                          <DropdownMenu.DropdownItem icon={<FeatherCalendar />}>
                            This month
                          </DropdownMenu.DropdownItem>
                        </DropdownMenu>
                      </SubframeCore.DropdownMenu.Content>
                    </SubframeCore.DropdownMenu.Portal>
                  </SubframeCore.DropdownMenu.Root>
                </div>
                <div className="flex items-center justify-center gap-4">
                  <Button
                    disabled={false}
                    variant="brand-primary"
                    size="large"
                    icon={null}
                    iconRight={null}
                    loading={false}
                    onClick={(event: React.MouseEvent<HTMLButtonElement>) => {}}
                  >
                    Add tasks
                  </Button>
                  <IconButton
                    variant="neutral-secondary"
                    size="large"
                    icon={<FeatherArrowUpRight />}
                    onClick={(event: React.MouseEvent<HTMLButtonElement>) => {}}
                  />
                </div>
              </div>
              <div className="flex w-full flex-col items-start">
                <TaskCard
                  image="https://res.cloudinary.com/subframe/image/upload/v1752163043/uploads/12900/v9r3qvfj6j3uwih10ssm.svg"
                  text="Call to confirm Sophia Turner appointment "
                />
                <TaskCard
                  image="https://res.cloudinary.com/subframe/image/upload/v1752163043/uploads/12900/v9r3qvfj6j3uwih10ssm.svg"
                  text="Call to confirm Sophia Turner appointment "
                />
                <TaskCard
                  image="https://res.cloudinary.com/subframe/image/upload/v1752163043/uploads/12900/v9r3qvfj6j3uwih10ssm.svg"
                  text="Call to confirm Sophia Turner appointment "
                />
                <TaskCard
                  image="https://res.cloudinary.com/subframe/image/upload/v1752163043/uploads/12900/v9r3qvfj6j3uwih10ssm.svg"
                  text="Call to confirm Sophia Turner appointment "
                />
                <TaskCard
                  image="https://res.cloudinary.com/subframe/image/upload/v1752163043/uploads/12900/v9r3qvfj6j3uwih10ssm.svg"
                  text="Call to confirm Sophia Turner appointment "
                />
                <TaskCard
                  image="https://res.cloudinary.com/subframe/image/upload/v1752163043/uploads/12900/v9r3qvfj6j3uwih10ssm.svg"
                  text="Call to confirm Sophia Turner appointment "
                />
                <TaskCard
                  image="https://res.cloudinary.com/subframe/image/upload/v1752163043/uploads/12900/v9r3qvfj6j3uwih10ssm.svg"
                  text="Call to confirm Sophia Turner appointment "
                />
                <TaskCard
                  image="https://res.cloudinary.com/subframe/image/upload/v1752163043/uploads/12900/v9r3qvfj6j3uwih10ssm.svg"
                  text="Call to confirm Sophia Turner appointment "
                />
              </div>
            </div>
            <div className="flex min-w-[176px] max-w-[448px] grow shrink-0 basis-0 flex-col items-start gap-6 self-stretch overflow-hidden rounded-lg bg-neutral-50 px-4 py-4">
              <div className="flex w-full items-center justify-between">
                <span className="text-heading-2 font-heading-2 text-default-font">
                  Calendar
                </span>
                <IconButton
                  variant="neutral-secondary"
                  size="large"
                  icon={<FeatherArrowUpRight />}
                  onClick={(event: React.MouseEvent<HTMLButtonElement>) => {}}
                />
              </div>
              <div className="flex w-full items-start gap-4">
                <Select
                  className="h-10 grow shrink-0 basis-0"
                  disabled={false}
                  error={false}
                  label=""
                  placeholder="Rafael Rodrigues"
                  helpText=""
                  value={undefined}
                  onValueChange={(value: string) => {}}
                >
                  <Select.Item value="Susan Miller">Susan Miller</Select.Item>
                  <Select.Item value="Joana Dias">Joana Dias</Select.Item>
                  <Select.Item value="Jason Smith">Jason Smith</Select.Item>
                  <Select.Item value="Rafael Souza">Rafael Souza</Select.Item>
                </Select>
                <IconButton
                  disabled={false}
                  variant="neutral-secondary"
                  size="large"
                  icon={<FeatherPlus />}
                  loading={false}
                  onClick={(event: React.MouseEvent<HTMLButtonElement>) => {}}
                />
              </div>
              <div className="flex w-full grow shrink-0 basis-0 flex-col items-start gap-1 overflow-y-auto">
                <SubframeCore.Popover.Root>
                  <SubframeCore.Popover.Trigger asChild={true}>
                    <CalendarHomepage
                      text="11:00 AM"
                      text2="11:15 AM"
                      text3="Sophia Turner"
                      text4="Scale and Polish"
                      variant2="confirmed"
                    />
                  </SubframeCore.Popover.Trigger>
                  <SubframeCore.Popover.Portal>
                    <SubframeCore.Popover.Content
                      side="left"
                      align="center"
                      sideOffset={4}
                      asChild={true}
                    >
                      <div className="flex flex-col items-start gap-1 rounded-lg shadow-lg">
                        <SchedulingCardDetails variant="booked" />
                      </div>
                    </SubframeCore.Popover.Content>
                  </SubframeCore.Popover.Portal>
                </SubframeCore.Popover.Root>
                <CalendarHomepage
                  text="11:00 AM"
                  text2="11:15 AM"
                  text3="Sophia Turner"
                  text4="Scale and Polish"
                />
                <CalendarHomepage
                  text="11:00 AM"
                  text2="11:15 AM"
                  text3="Sophia Turner"
                  text4="Scale and Polish"
                  variant2="confirmed"
                />
                <CalendarHomepage
                  text="11:00 AM"
                  text2="11:15 AM"
                  text3="Sophia Turner"
                  text4="Scale and Polish"
                />
                <CalendarHomepage
                  text="11:00 AM"
                  text2="11:15 AM"
                  text3="Sophia Turner"
                  text4="Scale and Polish"
                  variant2="confirmed"
                />
                <CalendarHomepage
                  text="11:00 AM"
                  text2="11:15 AM"
                  text3="Sophia Turner"
                  text4="Scale and Polish"
                />
                <CalendarHomepage
                  text="11:00 AM"
                  text2="11:15 AM"
                  text3="Sophia Turner"
                  text4="Scale and Polish"
                />
                <CalendarHomepage
                  text="11:00 AM"
                  text2="11:15 AM"
                  text3="Sophia Turner"
                  text4="Scale and Polish"
                  variant2="confirmed"
                />
                <CalendarHomepage
                  text="11:00 AM"
                  text2="11:15 AM"
                  text3="Sophia Turner"
                  text4="Scale and Polish"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </DefaultPageLayout>
  );
}

export default Task;
