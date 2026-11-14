"use client";
import { createContext, useContext } from "react";
import type { PaymentMethod } from "@/features/settings/schemas";

const PaymentSettingsContext = createContext<{ methods: PaymentMethod[] }>({ methods: [] });

export const PaymentSettingsProvider = PaymentSettingsContext.Provider;
export const usePaymentSettings = () => useContext(PaymentSettingsContext);
