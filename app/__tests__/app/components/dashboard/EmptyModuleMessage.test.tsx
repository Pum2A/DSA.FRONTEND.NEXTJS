import EmptyModuleMessage from "@/app/components/dashboard/EmptyModuleMessage";
import { render, screen } from "@testing-library/react";
import { Medal } from "lucide-react";

describe("EmptyModuleMessage", () => {
  test("renderuje komunikat z ikoną, tytułem i podtytułem", () => {
    const mockIcon = <Medal data-testid="medal-icon" />;
    const mockTitle = "Brak modułów";
    const mockSubtitle = "Zacznij swoją naukę";

    render(
      <EmptyModuleMessage
        icon={mockIcon}
        title={mockTitle}
        subtitle={mockSubtitle}
      />
    );

    expect(screen.getByTestId("medal-icon")).toBeInTheDocument();
    expect(screen.getByText(mockTitle)).toBeInTheDocument();
    expect(screen.getByText(mockSubtitle)).toBeInTheDocument();
  });

  test("stosuje odpowiednie style", () => {
    render(
      <EmptyModuleMessage
        icon={<div data-testid="test-icon" />}
        title="Test Title"
        subtitle="Test Subtitle"
      />
    );

    const container = screen.getByText("Test Title").parentElement;
    expect(container).toHaveClass("text-center");
  });
});
