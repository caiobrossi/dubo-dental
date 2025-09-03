"use client";

import React from "react";

interface ComingSoonPageProps {
  title: string;
}

export const ComingSoonPage: React.FC<ComingSoonPageProps> = ({ title }) => {
  return (
    <div className="flex grow shrink-0 basis-0 flex-col items-center gap-6 lg:gap-8 self-stretch px-4 lg:px-0 py-4 lg:py-0">
      
      {/* Desktop Title */}
      <div className="hidden lg:flex w-full items-center gap-2">
        <span className="grow shrink-0 basis-0 text-heading-2 font-heading-2 text-default-font">
          {title}
        </span>
      </div>

      {/* Coming Soon Content */}
      <div className="w-full max-w-full lg:max-w-3xl xl:max-w-4xl space-y-6 lg:space-y-8">
        <div className="flex flex-col items-center justify-center gap-6 py-12">
          <div className="text-center space-y-4">
            <h3 className="text-heading-3 font-heading-3 text-default-font">
              Coming Soon
            </h3>
            <p className="text-body-medium font-body-medium text-subtext-color max-w-md">
              This settings section is not yet available. Please check back later.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};