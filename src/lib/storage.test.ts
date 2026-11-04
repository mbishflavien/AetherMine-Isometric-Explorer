import { describe, expect, it } from "vitest";
import {
  getBrowserStorage,
  readJson,
  writeJson,
  type KeyValueStore,
} from "./storage";

function memoryStore(initial: Record<string, string> = {}): KeyValueStore & {
  data: Record<string, string>;
} {
  const data = { ...initial };
  return {
    data,
    getItem: (key) => (key in data ? data[key] : null),
    setItem: (key, value) => {
      data[key] = value;
    },
  };
}

describe("getBrowserStorage", () => {
  it("returns null outside the browser", () => {
    expect(getBrowserStorage()).toBeNull();
  });
});

describe("readJson", () => {
  it("returns null without a storage backend", () => {
    expect(readJson(null, "anything")).toBeNull();
  });

  it("parses stored JSON and tolerates corrupted values", () => {
    const store = memoryStore({
      settings: '{"enabled":true}',
      broken: "{not json",
    });

    expect(readJson<{ enabled: boolean }>(store, "settings")).toEqual({
      enabled: true,
    });
    expect(readJson(store, "broken")).toBeNull();
    expect(readJson(store, "missing")).toBeNull();
  });
});

describe("writeJson", () => {
  it("serializes values into the store", () => {
    const store = memoryStore();
    writeJson(store, "settings", { enabled: true });
    expect(store.data.settings).toBe('{"enabled":true}');
  });

  it("swallows quota failures so optional preferences never crash the app", () => {
    const store: KeyValueStore = {
      getItem: () => null,
      setItem: () => {
        throw new Error("QuotaExceededError");
      },
    };

    expect(() => writeJson(store, "settings", { enabled: true })).not.toThrow();
  });

  it("does nothing without a storage backend", () => {
    expect(() => writeJson(null, "settings", { enabled: true })).not.toThrow();
  });
});
