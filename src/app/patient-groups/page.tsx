"use client";

import React from "react";
import { Button } from "@/ui/components/Button";
import { DropdownMenu } from "@/ui/components/DropdownMenu";
import { PatientGroupCard } from "@/ui/components/PatientGroupCard";
import { SegmentControl } from "@/ui/components/SegmentControl";
import { DefaultPageLayout } from "@/ui/layouts/DefaultPageLayout";
import { FeatherComponent } from "@subframe/core";
import { FeatherCopy } from "@subframe/core";
import { FeatherEdit2 } from "@subframe/core";
import { FeatherPlus } from "@subframe/core";
import { FeatherTrash } from "@subframe/core";
import { FeatherUser } from "@subframe/core";
import * as SubframeCore from "@subframe/core";

function PatientGroups() {
  return (
    <DefaultPageLayout>
      <div className="flex h-full w-full flex-col items-start gap-4 bg-page-bg pr-3 py-3 mobile:flex-col mobile:flex-nowrap mobile:gap-4">
        <div className="flex h-10 w-full flex-none items-center justify-between px-4 mobile:container mobile:max-w-none">
          <div className="flex flex-col items-start gap-2">
            <span className="text-heading-2 font-heading-2 text-default-font">
              Patients
            </span>
          </div>
          <SegmentControl className="h-10 w-auto flex-none" variant="default">
            <SegmentControl.Item>Patient listing</SegmentControl.Item>
            <SegmentControl.Item active={true}>
              Patient groups
            </SegmentControl.Item>
          </SegmentControl>
          <SubframeCore.DropdownMenu.Root>
            <SubframeCore.DropdownMenu.Trigger asChild={true}>
              <Button
                disabled={false}
                variant="brand-primary"
                size="large"
                icon={<FeatherPlus />}
                iconRight={null}
                loading={false}
                onClick={(event: React.MouseEvent<HTMLButtonElement>) => {}}
              >
                Add new
              </Button>
            </SubframeCore.DropdownMenu.Trigger>
            <SubframeCore.DropdownMenu.Portal>
              <SubframeCore.DropdownMenu.Content
                side="bottom"
                align="end"
                sideOffset={4}
                asChild={true}
              >
                <DropdownMenu>
                  <DropdownMenu.DropdownItem icon={<FeatherUser />}>
                    Add new patient
                  </DropdownMenu.DropdownItem>
                  <DropdownMenu.DropdownItem icon={<FeatherComponent />}>
                    Add new group
                  </DropdownMenu.DropdownItem>
                </DropdownMenu>
              </SubframeCore.DropdownMenu.Content>
            </SubframeCore.DropdownMenu.Portal>
          </SubframeCore.DropdownMenu.Root>
        </div>
        <div className="flex w-full grow shrink-0 basis-0 flex-col items-start gap-2 rounded-lg bg-default-background px-4 py-4 overflow-auto">
          <div className="w-full items-start gap-4 grid grid-cols-4">
            <PatientGroupCard
              icon="https://res.cloudinary.com/subframe/image/upload/v1711417511/shared/t4qorgih4yjwudzjfkxq.png"
              title="Aesthetics patients"
              patientCount="34 patients"
              menuActions={
                <DropdownMenu>
                  <DropdownMenu.DropdownItem icon={<FeatherEdit2 />}>
                    Edit group
                  </DropdownMenu.DropdownItem>
                  <DropdownMenu.DropdownItem icon={<FeatherCopy />}>
                    Duplicate group
                  </DropdownMenu.DropdownItem>
                  <DropdownMenu.DropdownItem icon={<FeatherTrash />}>
                    Delete
                  </DropdownMenu.DropdownItem>
                </DropdownMenu>
              }
            />
            <PatientGroupCard
              icon="https://res.cloudinary.com/subframe/image/upload/v1711417511/shared/t4qorgih4yjwudzjfkxq.png"
              title="Patients over 65"
              patientCount="34 patients"
              menuActions={
                <DropdownMenu>
                  <DropdownMenu.DropdownItem icon={<FeatherEdit2 />}>
                    Edit group
                  </DropdownMenu.DropdownItem>
                  <DropdownMenu.DropdownItem icon={<FeatherCopy />}>
                    Duplicate group
                  </DropdownMenu.DropdownItem>
                  <DropdownMenu.DropdownItem icon={<FeatherTrash />}>
                    Delete
                  </DropdownMenu.DropdownItem>
                </DropdownMenu>
              }
            />
            <PatientGroupCard
              icon="https://res.cloudinary.com/subframe/image/upload/v1711417511/shared/t4qorgih4yjwudzjfkxq.png"
              title="Kids"
              patientCount="34 patients"
              menuActions={
                <DropdownMenu>
                  <DropdownMenu.DropdownItem icon={<FeatherEdit2 />}>
                    Edit group
                  </DropdownMenu.DropdownItem>
                  <DropdownMenu.DropdownItem icon={<FeatherCopy />}>
                    Duplicate group
                  </DropdownMenu.DropdownItem>
                  <DropdownMenu.DropdownItem icon={<FeatherTrash />}>
                    Delete
                  </DropdownMenu.DropdownItem>
                </DropdownMenu>
              }
            />
            <PatientGroupCard
              icon="https://res.cloudinary.com/subframe/image/upload/v1711417511/shared/t4qorgih4yjwudzjfkxq.png"
              title="Dental patients"
              patientCount="34 patients"
              menuActions={
                <DropdownMenu>
                  <DropdownMenu.DropdownItem icon={<FeatherEdit2 />}>
                    Edit group
                  </DropdownMenu.DropdownItem>
                  <DropdownMenu.DropdownItem icon={<FeatherCopy />}>
                    Duplicate group
                  </DropdownMenu.DropdownItem>
                  <DropdownMenu.DropdownItem icon={<FeatherTrash />}>
                    Delete
                  </DropdownMenu.DropdownItem>
                </DropdownMenu>
              }
            />
          </div>
        </div>
      </div>
    </DefaultPageLayout>
  );
}

export default PatientGroups;
