"use client";
/*
 * Documentation:
 * Folders — https://app.subframe.com/e50163b8c1bc/library?component=Folders_ef5c3976-e130-4801-823d-8a814d84c9af
 * Icon Button — https://app.subframe.com/e50163b8c1bc/library?component=Icon+Button_af9405b1-8c54-4e01-9786-5aad308224f6
 */

import React from "react";
import { FeatherMoreVertical } from "@subframe/core";
import * as SubframeUtils from "../utils";
import { IconButton } from "./IconButton";

interface FoldersRootProps extends React.HTMLAttributes<HTMLDivElement> {
  folderName?: React.ReactNode;
  className?: string;
}

const FoldersRoot = React.forwardRef<HTMLDivElement, FoldersRootProps>(
  function FoldersRoot(
    { folderName, className, ...otherProps }: FoldersRootProps,
    ref
  ) {
    return (
      <div
        className={SubframeUtils.twClassNames(
          "group/ef5c3976 flex w-36 cursor-pointer flex-col items-start gap-2 relative",
          className
        )}
        ref={ref}
        {...otherProps}
      >
        <img
          className="flex-none"
          src="https://res.cloudinary.com/subframe/image/upload/v1754044020/uploads/12900/xjrc0wriweim7bel5yza.png"
        />
        <IconButton
          className="hidden absolute top-6 right-2 z-10 group-hover/ef5c3976:flex group-hover/ef5c3976:absolute group-hover/ef5c3976:top-6 group-hover/ef5c3976:right-2 group-hover/ef5c3976:z-10"
          disabled={false}
          variant="neutral-secondary"
          size="medium"
          icon={<FeatherMoreVertical />}
          loading={false}
        />
        {folderName ? (
          <span className="line-clamp-1 text-body-small font-body-small text-default-font">
            {folderName}
          </span>
        ) : null}
      </div>
    );
  }
);

export const Folders = FoldersRoot;
