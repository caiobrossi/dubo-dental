"use client";
/*
 * Documentation:
 * Text Field — https://app.subframe.com/e50163b8c1bc/library?component=Text+Field_be48ca43-f8e7-4c0e-8870-d219ea11abfe
 */

import React from "react";
import * as SubframeCore from "@subframe/core";
import * as SubframeUtils from "../utils";

interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "placeholder"> {
  placeholder?: React.ReactNode;
  value?: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(function Input(
  { placeholder, className, ...otherProps }: InputProps,
  ref
) {
  return (
    <input
      className={SubframeUtils.twClassNames(
        "h-full w-full border-none bg-transparent text-body-medium font-body-medium text-default-font outline-none placeholder:text-neutral-400",
        className
      )}
      placeholder={placeholder as string}
      ref={ref}
      {...otherProps}
    />
  );
});

interface TextFieldRootProps
  extends React.LabelHTMLAttributes<HTMLLabelElement> {
  disabled?: boolean;
  error?: boolean;
  variant?: "outline" | "filled";
  label?: React.ReactNode;
  helpText?: React.ReactNode;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

const TextFieldRoot = React.forwardRef<HTMLLabelElement, TextFieldRootProps>(
  function TextFieldRoot(
    {
      disabled = false,
      error = false,
      variant = "outline",
      label,
      helpText,
      icon = null,
      iconRight = null,
      children,
      className,
      ...otherProps
    }: TextFieldRootProps,
    ref
  ) {
    return (
      <label
        className={SubframeUtils.twClassNames(
          "group/be48ca43 flex h-10 flex-col items-start justify-center gap-1",
          { "h-10 w-auto": variant === "filled" || disabled },
          className
        )}
        ref={ref}
        {...otherProps}
      >
        {label ? (
          <span className="text-body-medium font-body-medium text-default-font">
            {label}
          </span>
        ) : null}
        <div
          className={SubframeUtils.twClassNames(
            "flex h-10 w-full flex-none items-center gap-1 rounded-sm border border-solid border-neutral-300 bg-default-background px-2 group-focus-within/be48ca43:border-2 group-focus-within/be48ca43:border-solid group-focus-within/be48ca43:border-brand-primary",
            {
              "border-none bg-neutral-50 shadow-none group-hover/be48ca43:border-none group-hover/be48ca43:bg-neutral-100 group-focus-within/be48ca43:bg-default-background":
                variant === "filled",
              "border border-solid border-error-600": error,
              "border border-solid border-neutral-200 bg-neutral-200": disabled,
            }
          )}
        >
          {icon ? (
            <SubframeCore.IconWrapper className="text-body-medium font-body-medium text-subtext-color">
              {icon}
            </SubframeCore.IconWrapper>
          ) : null}
          {children ? (
            <div className="flex grow shrink-0 basis-0 flex-col items-start self-stretch px-1">
              {children}
            </div>
          ) : null}
          {iconRight ? (
            <SubframeCore.IconWrapper
              className={SubframeUtils.twClassNames(
                "text-body-medium font-body-medium text-subtext-color",
                { "text-error-500": error }
              )}
            >
              {iconRight}
            </SubframeCore.IconWrapper>
          ) : null}
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
      </label>
    );
  }
);

export const TextField = Object.assign(TextFieldRoot, {
  Input,
});
