// src/assets/components/layouts/TrialGuard.jsx
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { getSubscriptionStatus } from "../../../utils/Subscription";

export default function TrialGuard({ children }) {
  const status = getSubscriptionStatus();
  const location = useLocation();

  // If trial is over and they haven't picked 'Basic' tools or gone Pro
  if (status.trialExpired && !status.isPro && location.pathname !== "/app/settings") {
    // You could redirect to a "Choose Your 3" tool selection page here
    console.log("MVP NOTICE: 10-Day Trial Expired [cite: 3985]");
  }

  return children;
}