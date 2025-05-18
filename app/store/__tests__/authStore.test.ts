import { useAuthStore } from "../authStore";

// Reset store przed każdym testem, by testy nie wpływały na siebie
beforeEach(() => {
  useAuthStore.getState().reset();
});

describe("AuthStore", () => {
  it("ma domyślne wartości", () => {
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(state.isLoading).toBe(false);
    expect(state.error).toBeNull();
  });

  it("ustawia error po clearError", () => {
    useAuthStore.setState({ error: "Jakiś błąd" });
    useAuthStore.getState().clearError();
    expect(useAuthStore.getState().error).toBeNull();
  });

  it("czyści wszystko po reset", () => {
    useAuthStore.setState({
      user: { id: "1", userName: "x", email: "x" } as any,
      isAuthenticated: true,
      isLoading: true,
      error: "x",
    });
    useAuthStore.getState().reset();
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(state.isLoading).toBe(false);
    expect(state.error).toBeNull();
  });
});
