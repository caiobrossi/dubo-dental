"use client";
/*
 * Documentation:
 * Select — https://app.subframe.com/e50163b8c1bc/library?component=Select_bb88f90b-8c43-4b73-9c2f-3558ce7838f3
 */

import React from "react";
import { FeatherCheck } from "@subframe/core";
import { FeatherChevronDown } from "@subframe/core";
import * as SubframeCore from "@subframe/core";
import * as SubframeUtils from "../utils";

interface ItemProps
  extends Omit<React.ComponentProps<typeof SubframeCore.Select.Item>, "value"> {
  value: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

const Item = React.forwardRef<HTMLDivElement, ItemProps>(function Item(
  { value, children, className, ...otherProps }: ItemProps,
  ref
) {
  return (
    <SubframeCore.Select.Item
      value={value as string}
      asChild={true}
      {...otherProps}
    >
      <div
        className={SubframeUtils.twClassNames(
          "group/969e345b flex h-8 w-full cursor-pointer items-center gap-1 rounded-md px-3 hover:bg-neutral-100 active:bg-neutral-50 data-[highlighted]:bg-brand-50",
          className
        )}
        ref={ref}
      >
        <Select.ItemText className="h-auto grow shrink-0 basis-0">
          {children || value}
        </Select.ItemText>
        <FeatherCheck className="hidden text-body-medium font-body-medium text-default-font group-hover/969e345b:hidden group-data-[state=checked]/969e345b:inline-flex group-data-[state=checked]/969e345b:text-brand-600" />
      </div>
    </SubframeCore.Select.Item>
  );
});

interface TriggerValueProps
  extends React.ComponentProps<typeof SubframeCore.Select.Value> {
  placeholder?: React.ReactNode;
  variant?: "default" | "inversed";
  className?: string;
}

const TriggerValue = React.forwardRef<
  React.ElementRef<typeof SubframeCore.Select.Value>,
  TriggerValueProps
>(function TriggerValue(
  {
    placeholder,
    variant = "default",
    className,
    ...otherProps
  }: TriggerValueProps,
  ref
) {
  return (
    <SubframeCore.Select.Value
      className={SubframeUtils.twClassNames(
        "group/21c51472 w-full whitespace-nowrap text-body-medium font-body-medium text-default-font",
        { "text-white": variant === "inversed" },
        className
      )}
      ref={ref}
      placeholder={placeholder}
      {...otherProps}
    >
      Value
    </SubframeCore.Select.Value>
  );
});

interface ContentProps
  extends React.ComponentProps<typeof SubframeCore.Select.Content> {
  children?: React.ReactNode;
  className?: string;
}

const Content = React.forwardRef<HTMLDivElement, ContentProps>(function Content(
  { children, className, ...otherProps }: ContentProps,
  ref
) {
  return children ? (
    <SubframeCore.Select.Content asChild={true} {...otherProps}>
      <div
        className={SubframeUtils.twClassNames(
          "flex w-full flex-col items-start overflow-hidden rounded-md border border-solid border-neutral-border bg-white px-1 py-1 shadow-lg z-[60]",
          className
        )}
        ref={ref}
      >
        {children}
      </div>
    </SubframeCore.Select.Content>
  ) : null;
});

interface TriggerProps
  extends Omit<
    React.ComponentProps<typeof SubframeCore.Select.Trigger>,
    "placeholder"
  > {
  placeholder?: React.ReactNode;
  icon?: React.ReactNode;
  variant?: "default" | "inversed";
  filledText?: React.ReactNode;
  className?: string;
}

const Trigger = React.forwardRef<HTMLDivElement, TriggerProps>(function Trigger(
  {
    placeholder,
    icon = null,
    variant = "default",
    filledText,
    className,
    ...otherProps
  }: TriggerProps,
  ref
) {
  return (
    <SubframeCore.Select.Trigger asChild={true} {...otherProps}>
      <div
        className={SubframeUtils.twClassNames(
          "group/7ce1d396 flex h-full w-full items-center gap-2 px-3",
          className
        )}
        ref={ref}
      >
        {icon ? (
          <SubframeCore.IconWrapper className="text-body-medium font-body-medium text-neutral-400">
            {icon}
          </SubframeCore.IconWrapper>
        ) : null}
        <Select.TriggerValue
          placeholder={placeholder as string}
          variant={variant === "inversed" ? "inversed" : undefined}
        />
        <FeatherChevronDown
          className={SubframeUtils.twClassNames(
            "text-body-medium font-body-medium text-subtext-color",
            { "text-white": variant === "inversed" }
          )}
        />
      </div>
    </SubframeCore.Select.Trigger>
  );
});

interface ItemTextProps
  extends React.ComponentProps<typeof SubframeCore.Select.ItemText> {
  children?: React.ReactNode;
  variant?: "default" | "variation";
  className?: string;
}

const ItemText = React.forwardRef<HTMLSpanElement, ItemTextProps>(
  function ItemText(
    { children, variant = "default", className, ...otherProps }: ItemTextProps,
    ref
  ) {
    return children ? (
      <SubframeCore.Select.ItemText {...otherProps}>
        <span
          className={SubframeUtils.twClassNames(
            "group/c3085a74 text-body-medium font-body-medium text-default-font",
            { "text-white": variant === "variation" },
            className
          )}
          ref={ref}
        >
          {children}
        </span>
      </SubframeCore.Select.ItemText>
    ) : null;
  }
);

interface SelectRootProps
  extends React.ComponentProps<typeof SubframeCore.Select.Root> {
  disabled?: boolean;
  error?: boolean;
  variant?: "outline" | "filled" | "inverse";
  label?: React.ReactNode;
  placeholder?: React.ReactNode;
  helpText?: React.ReactNode;
  icon?: React.ReactNode;
  children?: React.ReactNode;
  value?: string;
  onValueChange?: (value: string) => void;
  className?: string;
}

const SelectRoot = React.forwardRef<HTMLDivElement, SelectRootProps>(
  function SelectRoot(
    {
      disabled = false,
      error = false,
      variant = "outline",
      label,
      placeholder,
      helpText,
      icon = null,
      children,
      className,
      value,
      defaultValue,
      onValueChange,
      open,
      defaultOpen,
      onOpenChange,
      dir,
      name,
      autoComplete,
      required,
      form,
      ...otherProps
    }: SelectRootProps,
    ref
  ) {
    return (
      <SubframeCore.Select.Root
        disabled={disabled}
        value={value}
        defaultValue={defaultValue}
        onValueChange={onValueChange}
        open={open}
        defaultOpen={defaultOpen}
        onOpenChange={onOpenChange}
        dir={dir}
        name={name}
        autoComplete={autoComplete}
        required={required}
        form={form}
      >
        <div
          className={SubframeUtils.twClassNames(
            "group/bb88f90b flex h-10 cursor-pointer flex-col items-start gap-1",
            {
              "h-full w-auto hover:h-10 hover:w-auto": variant === "filled",
              "h-10 w-auto cursor-default": disabled,
            },
            className
          )}
          ref={ref}
          {...otherProps}
        >
          {label ? (
            <span className="text-body-small font-body-small text-default-font">
              {label}
            </span>
          ) : null}
          <div
            className={SubframeUtils.twClassNames(
              "flex h-10 w-full flex-none flex-col items-start rounded-sm border border-solid border-neutral-300 bg-default-background group-focus-within/bb88f90b:border-2 group-focus-within/bb88f90b:border-solid group-focus-within/bb88f90b:border-brand-primary",
              {
                "border-none bg-transparent": variant === "inverse",
                "h-10 w-full flex-none rounded-sm border-none bg-neutral-100 group-hover/bb88f90b:w-full group-hover/bb88f90b:grow group-hover/bb88f90b:shrink-0 group-hover/bb88f90b:basis-0 group-hover/bb88f90b:border-none group-hover/bb88f90b:bg-neutral-200 group-focus-within/bb88f90b:!border group-focus-within/bb88f90b:!border-solid group-focus-within/bb88f90b:!border-brand-primary group-focus-within/bb88f90b:!bg-white":
                  variant === "filled",
                "border border-solid border-error-600": error,
                "h-10 w-full flex-none bg-neutral-200": disabled,
              }
            )}
          >
            <Trigger
              placeholder={placeholder}
              icon={icon}
              variant={variant === "inverse" ? "inversed" : undefined}
              filledText="Select"
            />
          </div>
          {helpText ? (
            <span
              className={SubframeUtils.twClassNames(
                "text-caption font-caption text-subtext-color",
                { "text-error-700": error }
              )}
            >
              {helpText}
            </span>
          ) : null}
          <Content>
            {children ? (
              <div className="flex w-full grow shrink-0 basis-0 flex-col items-start">
                {children}
              </div>
            ) : null}
          </Content>
        </div>
      </SubframeCore.Select.Root>
    );
  }
);

export const Select = Object.assign(SelectRoot, {
  Item,
  TriggerValue,
  Content,
  Trigger,
  ItemText,
});
