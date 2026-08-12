import React from "react";
import { HowItWorks } from "../../components/HowItWorks/HowItWorks";
import { PageTransition } from "../../components/Common/PageTransition";

export const HowItWorksPage = () => {
  return (
    <PageTransition className="bg-[#09090B] py-8">
      <HowItWorks />
    </PageTransition>
  );
};
