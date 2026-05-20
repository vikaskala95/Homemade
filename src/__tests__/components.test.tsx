import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

describe("UI Components", () => {
  describe("Button", () => {
    it("renders with text", () => {
      render(<Button>Click me</Button>);
      expect(screen.getByRole("button")).toHaveTextContent("Click me");
    });

    it("handles click events", async () => {
      const handleClick = jest.fn();
      render(<Button onClick={handleClick}>Click</Button>);
      await userEvent.click(screen.getByRole("button"));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it("can be disabled", () => {
      render(<Button disabled>Disabled</Button>);
      expect(screen.getByRole("button")).toBeDisabled();
    });

    it("renders with variants", () => {
      const { container } = render(<Button variant="destructive">Delete</Button>);
      expect(container.firstChild).toHaveClass("bg-red-500");
    });
  });

  describe("Input", () => {
    it("renders and accepts input", async () => {
      render(<Input placeholder="Type here" />);
      const input = screen.getByPlaceholderText("Type here");
      await userEvent.type(input, "hello");
      expect(input).toHaveValue("hello");
    });

    it("can be disabled", () => {
      render(<Input disabled />);
      expect(screen.getByRole("textbox")).toBeDisabled();
    });
  });

  describe("Badge", () => {
    it("renders with text", () => {
      render(<Badge>Active</Badge>);
      expect(screen.getByText("Active")).toBeInTheDocument();
    });
  });

  describe("Card", () => {
    it("renders card with header and content", () => {
      render(
        <Card>
          <CardHeader><CardTitle>Title</CardTitle></CardHeader>
          <CardContent><p>Content</p></CardContent>
        </Card>
      );
      expect(screen.getByText("Title")).toBeInTheDocument();
      expect(screen.getByText("Content")).toBeInTheDocument();
    });
  });
});
