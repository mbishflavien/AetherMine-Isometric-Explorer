export interface SplitMetric {
  label: string;
  value: string;
}

export function splitMetric(metric: string): SplitMetric {
  const separator = metric.indexOf(":");
  if (separator === -1) {
    return { label: metric.trim(), value: "" };
  }
  return {
    label: metric.slice(0, separator).trim(),
    value: metric.slice(separator + 1).trim(),
  };
}
