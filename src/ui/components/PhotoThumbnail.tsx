"use client";
/*
 * Documentation:
 * Icon Button — https://app.subframe.com/e50163b8c1bc/library?component=Icon+Button_af9405b1-8c54-4e01-9786-5aad308224f6
 * Photo thumbnail — https://app.subframe.com/e50163b8c1bc/library?component=Photo+thumbnail_30a9b7d9-9688-4745-befe-a53b34cbb06c
 */

import React from "react";
import { FeatherMoreVertical } from "@subframe/core";
import { FeatherPlus } from "@subframe/core";
import * as SubframeUtils from "../utils";
import { IconButton } from "./IconButton";

interface PhotoThumbnailRootProps extends React.HTMLAttributes<HTMLDivElement> {
  image?: string;
  text?: React.ReactNode;
  className?: string;
}

const PhotoThumbnailRoot = React.forwardRef<
  HTMLDivElement,
  PhotoThumbnailRootProps
>(function PhotoThumbnailRoot(
  { image, text, className, ...otherProps }: PhotoThumbnailRootProps,
  ref
) {
  return (
    <div
      className={SubframeUtils.twClassNames(
        "group/30a9b7d9 flex w-36 cursor-pointer flex-col items-start gap-2 relative",
        className
      )}
      ref={ref}
      {...otherProps}
    >
      <IconButton
        className="hidden absolute top-2 right-2 z-10 group-hover/30a9b7d9:absolute group-hover/30a9b7d9:top-2 group-hover/30a9b7d9:right-2 group-hover/30a9b7d9:z-10"
        disabled={false}
        variant="neutral-secondary"
        size="medium"
        icon={<FeatherPlus />}
        loading={false}
      />
      {image ? <img className="flex-none" src={image} /> : null}
      <IconButton
        className="hidden absolute top-6 right-2 z-10 group-hover/30a9b7d9:flex group-hover/30a9b7d9:absolute group-hover/30a9b7d9:top-2 group-hover/30a9b7d9:right-2 group-hover/30a9b7d9:z-10"
        disabled={false}
        variant="neutral-secondary"
        size="medium"
        icon={<FeatherMoreVertical />}
        loading={false}
      />
      {text ? (
        <span className="line-clamp-2 text-body-small font-body-small text-default-font">
          {text}
        </span>
      ) : null}
      <span className="line-clamp-1 text-caption font-caption text-subtext-color">
        12/03/2025  12:32
      </span>
    </div>
  );
});

export const PhotoThumbnail = PhotoThumbnailRoot;
