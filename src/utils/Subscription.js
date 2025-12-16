// src/utils/Subscription.js

const SUBSCRIPTION_KEY = "3c-sub-data";

export function getSubscriptionStatus() {
  const raw = localStorage.getItem(SUBSCRIPTION_KEY);
  const now = new Date();
  
  if (!raw) {
    // Start 10-day trial for new users
    const trialEnd = new Date();
    trialEnd.setDate(now.getDate() + 10);
    const initialData = {
      isTrial: true,
      trialEndDate: trialEnd.toISOString(),
      isPro: false,
      deliveryPass: false,
      selectedTools: [] // For Basic mode
    };
    localStorage.setItem(SUBSCRIPTION_KEY, JSON.stringify(initialData));
    return initialData;
  }

  const data = JSON.parse(raw);
  const trialExpired = new Date(data.trialEndDate) < now;

  return {
    ...data,
    trialExpired,
    isBasic: trialExpired && !data.isPro,
    isFullAccess: data.isPro || !trialExpired
  };
}

export function toggleDeliveryPass() {
  const data = getSubscriptionStatus();
  data.deliveryPass = !data.deliveryPass;
  localStorage.setItem(SUBSCRIPTION_KEY, JSON.stringify(data));
  return data;
}