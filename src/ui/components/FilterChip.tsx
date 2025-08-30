"use client";
/*
 * Documentation:
 * Filter chip — https://app.subframe.com/e50163b8c1bc/library?component=Filter+chip_3f77da86-792e-411f-8bd6-a4f505df5ea4
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
          "group/2b71af89 flex h-8 w-full cursor-pointer items-center gap-1 rounded-md px-3 hover:bg-neutral-100 active:bg-neutral-50 data-[highlighted]:bg-brand-50",
          className
        )}
        ref={ref}
      >
        <FilterChip.ItemText className="h-auto grow shrink-0 basis-0">
          {children || value}
        </FilterChip.ItemText>
        <FeatherCheck className="hidden text-body-medium font-body-medium text-default-font group-hover/2b71af89:hidden group-data-[state=checked]/2b71af89:inline-flex group-data-[state=checked]/2b71af89:text-brand-600" />
      </div>
    </SubframeCore.Select.Item>
  );
});

interface TriggerValueProps
  extends React.ComponentProps<typeof SubframeCore.Select.Value> {
  placeholder?: React.ReactNode;
  className?: string;
}

const TriggerValue = React.forwardRef<
  React.ElementRef<typeof SubframeCore.Select.Value>,
  TriggerValueProps
>(function TriggerValue(
  { placeholder, className, ...otherProps }: TriggerValueProps,
  ref
) {
  return (
    <SubframeCore.Select.Value
      className={SubframeUtils.twClassNames(
        "w-full whitespace-nowrap text-body-medium font-body-medium text-default-font",
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
          "flex w-full flex-col items-start overflow-hidden rounded-md border border-solid border-neutral-border bg-white px-1 py-1 shadow-lg",
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
  className?: string;
}

const Trigger = React.forwardRef<HTMLDivElement, TriggerProps>(function Trigger(
  { placeholder, icon = null, className, ...otherProps }: TriggerProps,
  ref
) {
  return (
    <SubframeCore.Select.Trigger asChild={true} {...otherProps}>
      <div
        className={SubframeUtils.twClassNames(
          "flex h-full w-full items-center gap-2 px-3",
          className
        )}
        ref={ref}
      >
        {icon ? (
          <SubframeCore.IconWrapper className="text-body-medium font-body-medium text-neutral-400">
            {icon}
          </SubframeCore.IconWrapper>
        ) : null}
        <FilterChip.TriggerValue placeholder={placeholder as string} />
        <FeatherChevronDown className="text-body-medium font-body-medium text-subtext-color" />
      </div>
    </SubframeCore.Select.Trigger>
  );
});

interface ItemTextProps
  extends React.ComponentProps<typeof SubframeCore.Select.ItemText> {
  children?: React.ReactNode;
  className?: string;
}

const ItemText = React.forwardRef<HTMLSpanElement, ItemTextProps>(
  function ItemText(
    { children, className, ...otherProps }: ItemTextProps,
    ref
  ) {
    return children ? (
      <SubframeCore.Select.ItemText {...otherProps}>
        <span
          className={SubframeUtils.twClassNames(
            "text-body-medium font-body-medium text-default-font",
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

interface FilterChipRootProps
  extends React.ComponentProps<typeof SubframeCore.Select.Root> {
  disabled?: boolean;
  error?: boolean;
  variant?: "outline" | "filled";
  label?: React.ReactNode;
  placeholder?: React.ReactNode;
  helpText?: React.ReactNode;
  icon?: React.ReactNode;
  children?: React.ReactNode;
  value?: string;
  onValueChange?: (value: string) => void;
  className?: string;
}

const FilterChipRoot = React.forwardRef<HTMLDivElement, FilterChipRootProps>(
  function FilterChipRoot(
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
    }: FilterChipRootProps,
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
            "group/3f77da86 flex h-10 cursor-pointer flex-col items-start gap-1 hover:rounded-full hover:bg-new-white-80",
            { "h-10 w-auto": variant === "filled" },
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
              "flex h-10 w-full flex-none flex-col items-start rounded-full group-focus-within/3f77da86:border-2 group-focus-within/3f77da86:border-solid group-focus-within/3f77da86:border-brand-primary",
              {
                "h-10 w-full flex-none rounded-full border-none bg-new-gray-4 group-hover/3f77da86:border-none group-hover/3f77da86:bg-new-white-70":
                  variant === "filled",
                "border border-solid border-error-600": error,
                "bg-neutral-200": disabled,
              }
            )}
          >
            <Trigger placeholder={placeholder} icon={icon} />
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

export const FilterChip = Object.assign(FilterChipRoot, {
  Item,
  TriggerValue,
  Content,
  Trigger,
  ItemText,
});
