import { useLoadingStore } from "../loadingStore";

describe("LoadingStore", () => {
  beforeEach(() => {
    useLoadingStore.getState().resetLoading();
  });

  it("czy jest domyslnie ustawione jako false", () => {
    expect(useLoadingStore.getState().loading).toBe(false);
  });

  it("czy ustawia poprawnie na true", () => {
    useLoadingStore.getState().setLoading(true);
    expect(useLoadingStore.getState().loading).toBe(true);
  });

  it("czy ustawia poprawnie na false", () => {
    useLoadingStore.getState().setLoading(true);
    useLoadingStore.getState().setLoading(false);
    expect(useLoadingStore.getState().loading).toBe(false);
  });

  it("resetuje loading do false", () => {
    useLoadingStore.getState().setLoading(true);
    useLoadingStore.getState().resetLoading();
    expect(useLoadingStore.getState().loading).toBe(false);
  });
});
