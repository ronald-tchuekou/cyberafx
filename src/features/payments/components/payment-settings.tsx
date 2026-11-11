"use client";
import { createContext, useContext } from "react";

type Ctx = { usdtAddress: string; usdtNetwork: string };
const PaymentSettingsContext = createContext<Ctx>({ usdtAddress: "", usdtNetwork: "TRC20" });

export const PaymentSettingsProvider = PaymentSettingsContext.Provider;
export const usePaymentSettings = () => useContext(PaymentSettingsContext);
