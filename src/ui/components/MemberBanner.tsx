"use client";
/*
 * Documentation:
 * Avatar — https://app.subframe.com/e50163b8c1bc/library?component=Avatar_bec25ae6-5010-4485-b46b-cf79e3943ab2
 * Member banner — https://app.subframe.com/e50163b8c1bc/library?component=Member+banner_3ea7be8f-d98a-4df7-b324-268cf9842102
 */

import React from "react";
import { FeatherCake } from "@subframe/core";
import { FeatherIdCard } from "@subframe/core";
import { FeatherUsers } from "@subframe/core";
import * as SubframeUtils from "../utils";
import { Avatar } from "./Avatar";

interface MemberBannerRootProps extends React.HTMLAttributes<HTMLDivElement> {
  name?: React.ReactNode;
  alerts?: React.ReactNode;
  gender?: React.ReactNode;
  age?: React.ReactNode;
  patientId?: React.ReactNode;
  contactButtons?: React.ReactNode;
  editProfile?: React.ReactNode;
  navigation?: React.ReactNode;
  className?: string;
}

const MemberBannerRoot = React.forwardRef<
  HTMLDivElement,
  MemberBannerRootProps
>(function MemberBannerRoot(
  {
    name,
    alerts,
    gender,
    age,
    patientId,
    contactButtons,
    editProfile,
    navigation,
    className,
    ...otherProps
  }: MemberBannerRootProps,
  ref
) {
  return (
    <div
      className={SubframeUtils.twClassNames(
        "flex w-full flex-col items-center gap-2",
        className
      )}
      ref={ref}
      {...otherProps}
    >
      <div className="flex w-full items-start justify-between px-2 py-2">
        <div className="flex items-start gap-4">
          <Avatar
            size="x-large"
            image="https://res.cloudinary.com/subframe/image/upload/v1711417514/shared/ubsk7cs5hnnaj798efej.jpg"
          >
            A
          </Avatar>
          <div className="flex flex-col items-start gap-3">
            <div className="flex w-full items-start gap-8">
              {name ? (
                <span className="text-heading-1 font-heading-1 text-default-font">
                  {name}
                </span>
              ) : null}
              {alerts ? (
                <div className="flex items-start gap-8">{alerts}</div>
              ) : null}
            </div>
            <div className="flex items-start gap-6">
              <div className="flex items-start gap-2">
                <FeatherUsers className="text-body-medium font-body-medium text-default-font" />
                {gender ? (
                  <span className="text-body-medium font-body-medium text-subtext-color">
                    {gender}
                  </span>
                ) : null}
              </div>
              <div className="flex items-start gap-2">
                <FeatherCake className="text-body-medium font-body-medium text-default-font" />
                {age ? (
                  <span className="text-body-medium font-body-medium text-subtext-color">
                    {age}
                  </span>
                ) : null}
              </div>
              <div className="flex items-start gap-2">
                <FeatherIdCard className="text-body-medium font-body-medium text-default-font" />
                {patientId ? (
                  <span className="text-body-medium font-body-medium text-subtext-color">
                    {patientId}
                  </span>
                ) : null}
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-start justify-center gap-4">
          {contactButtons ? (
            <div className="flex items-start justify-center gap-4">
              {contactButtons}
            </div>
          ) : null}
          {editProfile ? (
            <div className="flex items-start justify-center gap-4">
              {editProfile}
            </div>
          ) : null}
        </div>
      </div>
      {navigation ? (
        <div className="flex flex-col items-center gap-2">{navigation}</div>
      ) : null}
    </div>
  );
});

export const MemberBanner = MemberBannerRoot;
