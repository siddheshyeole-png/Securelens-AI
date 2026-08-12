import React from "react";
import { Features } from "../../components/Features/Features";
import { PageTransition } from "../../components/Common/PageTransition";

export const FeaturesPage = () => {
  return (
    <PageTransition className="bg-[#09090B] py-8">
      <Features />
    </PageTransition>
  );
};
