import { useErrorStore } from "../errorStore";

describe("ErrorStore", () => {
  beforeEach(() => {
    useErrorStore.getState().clearError();
  });

  it("ma domyślnie pusty error", () => {
    expect(useErrorStore.getState().error).toBeNull();
  });

  it("ustawia blad", () => {
    useErrorStore.getState().setError("Jakiś błąd");
    expect(useErrorStore.getState().error).toBe("Jakiś błąd");
  });

  it("czyści blad", () => {
    useErrorStore.getState().setError("Ups, Błąd!");
    useErrorStore.getState().clearError();
    expect(useErrorStore.getState().error).toBeNull();
  });
});
