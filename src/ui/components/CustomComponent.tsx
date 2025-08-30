"use client";
/*
 * Documentation:
 * Custom Component — https://app.subframe.com/e50163b8c1bc/library?component=Custom+Component_796b5fce-91cd-4f57-b89b-e2a06b8f47c5
 */

import React from "react";
import * as SubframeUtils from "../utils";

interface MedicalHistoryFormProps
  extends React.HTMLAttributes<HTMLSpanElement> {
  text?: React.ReactNode;
  className?: string;
}

const MedicalHistoryForm = React.forwardRef<
  HTMLSpanElement,
  MedicalHistoryFormProps
>(function MedicalHistoryForm(
  { text, className, ...otherProps }: MedicalHistoryFormProps,
  ref
) {
  return text ? (
    <span
      className={SubframeUtils.twClassNames(
        "text-heading-3 font-heading-3 text-default-font",
        className
      )}
      ref={ref}
      {...otherProps}
    >
      {text}
    </span>
  ) : null;
});

interface _30QuestionsProps extends React.HTMLAttributes<HTMLSpanElement> {
  text?: React.ReactNode;
  className?: string;
}

const _30Questions = React.forwardRef<HTMLSpanElement, _30QuestionsProps>(
  function _30Questions(
    { text, className, ...otherProps }: _30QuestionsProps,
    ref
  ) {
    return text ? (
      <span
        className={SubframeUtils.twClassNames(
          "text-body-small font-body-small text-subtext-color",
          className
        )}
        ref={ref}
        {...otherProps}
      >
        {text}
      </span>
    ) : null;
  }
);

interface CustomComponentRootProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "content"> {
  content?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

const CustomComponentRoot = React.forwardRef<
  HTMLDivElement,
  CustomComponentRootProps
>(function CustomComponentRoot(
  { content, children, className, ...otherProps }: CustomComponentRootProps,
  ref
) {
  return content ? (
    <div
      className={SubframeUtils.twClassNames(
        "group/796b5fce flex h-40 cursor-pointer flex-col items-start justify-between rounded-rounded-xlarge border border-solid border-neutral-border bg-default-background px-4 py-4 hover:flex hover:h-40 hover:w-full hover:flex-col hover:flex-nowrap hover:items-start hover:justify-between hover:rounded-rounded-xlarge hover:border-2 hover:border-solid hover:border-new-white-100 hover:bg-neutral-50 hover:shadow-md",
        className
      )}
      ref={ref}
      {...otherProps}
    >
      {content}
    </div>
  ) : null;
});

export const CustomComponent = Object.assign(CustomComponentRoot, {
  MedicalHistoryForm,
  _30Questions,
});
