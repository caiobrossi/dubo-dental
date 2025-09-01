"use client";
/*
 * Documentation:
 * Accordion — https://app.subframe.com/e50163b8c1bc/library?component=Accordion_d2e81e20-863a-4027-826a-991d8910efd9
 * Icon Button — https://app.subframe.com/e50163b8c1bc/library?component=Icon+Button_af9405b1-8c54-4e01-9786-5aad308224f6
 */

import React from "react";
import { FeatherChevronDown } from "@subframe/core";
import { FeatherMoreVertical } from "@subframe/core";
import * as SubframeCore from "@subframe/core";
import * as SubframeUtils from "../utils";
import { IconButton } from "./IconButton";

interface ChevronProps
  extends React.ComponentProps<typeof SubframeCore.Collapsible.Chevron> {
  className?: string;
}

const Chevron = React.forwardRef<
  React.ElementRef<typeof FeatherChevronDown>,
  ChevronProps
>(function Chevron({ className, ...otherProps }: ChevronProps, ref) {
  return (
    <SubframeCore.Collapsible.Chevron {...otherProps}>
      <FeatherChevronDown
        className={SubframeUtils.twClassNames(
          "text-body-medium font-body-medium text-default-font",
          className
        )}
        ref={ref}
      />
    </SubframeCore.Collapsible.Chevron>
  );
});

interface ContentProps
  extends React.ComponentProps<typeof SubframeCore.Collapsible.Content> {
  test?: React.ReactNode;
  variant?: "default";
  children?: React.ReactNode;
  className?: string;
}

const Content = React.forwardRef<HTMLDivElement, ContentProps>(function Content(
  {
    test,
    variant = "default",
    children,
    className,
    ...otherProps
  }: ContentProps,
  ref
) {
  return test ? (
    <SubframeCore.Collapsible.Content asChild={true} {...otherProps}>
      <div
        className={SubframeUtils.twClassNames(
          "group/991223eb flex w-full cursor-pointer flex-col items-start gap-2",
          className
        )}
        ref={ref}
      >
        {test}
      </div>
    </SubframeCore.Collapsible.Content>
  ) : null;
});

interface TriggerProps
  extends React.ComponentProps<typeof SubframeCore.Collapsible.Trigger> {
  children?: React.ReactNode;
  className?: string;
}

const Trigger = React.forwardRef<HTMLDivElement, TriggerProps>(function Trigger(
  { children, className, ...otherProps }: TriggerProps,
  ref
) {
  return children ? (
    <SubframeCore.Collapsible.Trigger asChild={true} {...otherProps}>
      <div
        className={SubframeUtils.twClassNames(
          "flex w-full cursor-pointer flex-col items-start gap-2",
          className
        )}
        ref={ref}
      >
        {children}
      </div>
    </SubframeCore.Collapsible.Trigger>
  ) : null;
});

interface AccordionRootProps
  extends React.ComponentProps<typeof SubframeCore.Collapsible.Root> {
  trigger?: React.ReactNode;
  children?: React.ReactNode;
  variant?: "default";
  className?: string;
}

const AccordionRoot = React.forwardRef<HTMLDivElement, AccordionRootProps>(
  function AccordionRoot(
    {
      trigger,
      children,
      variant = "default",
      className,
      ...otherProps
    }: AccordionRootProps,
    ref
  ) {
    return (
      <SubframeCore.Collapsible.Root asChild={true} {...otherProps}>
        <div
          className={SubframeUtils.twClassNames(
            "group/d2e81e20 flex w-full flex-col items-start rounded-md",
            className
          )}
          ref={ref}
        >
          <Trigger>
            {trigger ? (
              <div className="flex w-full grow shrink-0 basis-0 flex-col items-start group-data-[state=open]/d2e81e20:h-auto group-data-[state=open]/d2e81e20:w-full group-data-[state=open]/d2e81e20:flex-none">
                {trigger}
              </div>
            ) : null}
          </Trigger>
          <Content
            test={
              children ? (
                <div className="flex w-full grow shrink-0 basis-0 flex-col items-start">
                  {children}
                </div>
              ) : null
            }
            variant={variant}
          >
            <div className="flex flex-col items-start gap-2">
              <span className="text-body-medium font-body-medium text-default-font">
                Accordion contents
              </span>
              <IconButton
                className="hidden"
                disabled={false}
                variant="neutral-tertiary"
                size="small"
                icon={<FeatherMoreVertical />}
                loading={false}
              />
            </div>
          </Content>
        </div>
      </SubframeCore.Collapsible.Root>
    );
  }
);

export const Accordion = Object.assign(AccordionRoot, {
  Chevron,
  Content,
  Trigger,
});
