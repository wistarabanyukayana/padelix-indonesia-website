"use client";

import { ActionState } from "@/types";
import { useEffect, useRef } from "react";
import { toast } from "sonner";

type NewItemState = {
  hasNew: boolean;
  clearNewParam: () => void;
};

type ActionFeedbackOptions = {
  newItem?: NewItemState;
};

export function useActionFeedback(
  state: ActionState,
  isPending: boolean,
  options?: ActionFeedbackOptions,
) {
  const lastToastRef = useRef<string | null>(null);
  const newItem = options?.newItem;

  useEffect(() => {
    if (state?.redirectTo) {
      window.location.assign(state.redirectTo);
    }
  }, [state?.redirectTo]);

  useEffect(() => {
    if (isPending) lastToastRef.current = null;
  }, [isPending]);

  useEffect(() => {
    if (!state?.message) return;
    const toastKey = `${state.success}-${state.message}`;
    if (lastToastRef.current === toastKey) return;
    lastToastRef.current = toastKey;
    if (state.success) {
      toast.success(state.message);
      if (newItem?.hasNew) newItem.clearNewParam();
    } else {
      toast.error(state.message);
    }
  }, [newItem, state]);
}
