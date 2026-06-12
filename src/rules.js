const getRuleDisabled = (result, defaultReason) => {
  if (!result) {
    return null;
  }
  if (typeof result === 'boolean') {
    return result ? { disabled: true, reason: defaultReason } : null;
  }
  if (result.disabled) {
    return { disabled: true, reason: result.reason || defaultReason };
  }
  return null;
};

export const checkRule = ({ date, slot, mode, disabledDate, disabledDateTime, availableDateTime }) => {
  if (disabledDate?.(date.toDate())) {
    return { disabled: true };
  }
  const ctx = {
    date: date.toDate(),
    mode,
    ...(slot
      ? {
          slot: {
            start: slot.start.toDate(),
            end: slot.end.toDate()
          }
        }
      : {})
  };
  const disabledResult = getRuleDisabled(disabledDateTime?.(ctx));
  if (disabledResult) {
    return disabledResult;
  }
  if (availableDateTime && !availableDateTime(ctx)) {
    return { disabled: true };
  }
  return null;
};
