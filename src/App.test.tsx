import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { App } from "./App";

describe("Championship Day", () => {
	it("renders the page heading", () => {
		render(<App />);

		expect(
			screen.getByRole("heading", { level: 1, name: "Championship Day" }),
		).toBeInTheDocument();
	});

	it("provides a text alternative for the course details in the header image", () => {
		render(<App />);

		expect(
			screen.getByRole("img", {
				name: "Course: 58 gates, 180 m vertical drop",
			}),
		).toBeInTheDocument();
	});

	it("shows every heat on the schedule", () => {
		render(<App />);

		expect(screen.getByText("Heat 1")).toBeInTheDocument();
		expect(screen.getByText("Heat 2")).toBeInTheDocument();
		expect(screen.getByText("Heat 3")).toBeInTheDocument();
	});

	it("shows finished sessions when Finished is chosen", async () => {
		const user = userEvent.setup();
		render(<App />);

		await user.click(screen.getByRole("radio", { name: "Finished" }));

		expect(screen.getByText("Heat 2")).toBeInTheDocument();
		expect(screen.queryByText("Heat 1")).not.toBeInTheDocument();
	});

	it("switches session filters with arrow keys and Space", async () => {
		const user = userEvent.setup();
		render(<App />);

		const allSessions = screen.getByRole("radio", { name: "All sessions" });
		const finished = screen.getByRole("radio", { name: "Finished" });
		const liveOnly = screen.getByRole("radio", { name: "Live only" });

		expect(
			screen.getByRole("group", { name: "Filter sessions" }),
		).toBeInTheDocument();
		expect(allSessions).toBeChecked();

		allSessions.focus();
		await user.keyboard("{ArrowRight}");
		expect(finished).toBeChecked();
		expect(screen.getByText("Heat 2")).toBeInTheDocument();
		expect(screen.queryByText("Heat 1")).not.toBeInTheDocument();

		liveOnly.focus();
		await user.keyboard(" ");
		expect(liveOnly).toBeChecked();
		expect(screen.getByText("Heat 1")).toBeInTheDocument();
	});

	it("shows an athlete when Results is chosen", async () => {
		const user = userEvent.setup();
		render(<App />);

		await user.click(screen.getByRole("tab", { name: "Results" }));

		const lenaRow = screen.getByRole("row", { name: /Lena Berg/ });
		const sofiaRow = screen.getByRole("row", { name: /Sofia Rossi/ });
		expect(
			screen.getByRole("columnheader", { name: "Athlete" }),
		).toBeInTheDocument();
		expect(
			within(lenaRow).getByRole("cell", { name: "Qualified" }),
		).toBeInTheDocument();
		expect(
			within(sofiaRow).getByRole("cell", { name: "Eliminated" }),
		).toBeInTheDocument();
	});

	it("exposes accessible sort labels and the active sort direction", async () => {
		const user = userEvent.setup();
		render(<App />);

		await user.click(screen.getByRole("tab", { name: "Results" }));

		const rankButton = screen.getByRole("button", { name: "Sort by Rank" });
		const bibButton = screen.getByRole("button", { name: "Sort by Bib" });
		const rankHeader = rankButton.closest("th");
		const bibHeader = bibButton.closest("th");
		if (rankHeader === null || bibHeader === null) {
			throw new Error(
				"Expected sort controls to be inside their column headers",
			);
		}

		expect(rankHeader).toHaveAttribute("aria-sort", "ascending");
		expect(bibHeader).not.toHaveAttribute("aria-sort");

		await user.click(bibButton);
		expect(rankHeader).not.toHaveAttribute("aria-sort");
		expect(bibHeader).toHaveAttribute("aria-sort", "descending");

		await user.click(bibButton);
		expect(bibHeader).toHaveAttribute("aria-sort", "ascending");
	});

	it("navigates between view tabs with arrow keys and associates each panel", async () => {
		const user = userEvent.setup();
		render(<App />);

		const scheduleTab = screen.getByRole("tab", { name: "Schedule" });
		const resultsTab = screen.getByRole("tab", { name: "Results" });
		const medalsTab = screen.getByRole("tab", { name: "Medals" });

		expect(screen.getByRole("tablist", { name: "Views" })).toHaveAttribute(
			"aria-orientation",
			"horizontal",
		);
		expect(scheduleTab).toHaveAttribute("tabindex", "0");
		expect(resultsTab).toHaveAttribute("tabindex", "-1");

		for (const tab of [scheduleTab, resultsTab, medalsTab]) {
			const panelId = tab.getAttribute("aria-controls");
			if (panelId === null) {
				throw new Error("Expected each view tab to control a panel");
			}

			const panel = document.getElementById(panelId);
			if (panel === null) {
				throw new Error(
					"Expected aria-controls to reference an existing panel",
				);
			}

			expect(panel).toHaveAttribute("role", "tabpanel");
			expect(panel).toHaveAttribute("aria-labelledby", tab.id);
		}

		scheduleTab.focus();
		await user.keyboard("{ArrowRight}");
		expect(resultsTab).toHaveFocus();
		expect(resultsTab).toHaveAttribute("aria-selected", "true");
		expect(screen.getByRole("tabpanel")).toHaveAttribute("id", "results");

		await user.keyboard("{End}");
		expect(medalsTab).toHaveFocus();
		expect(medalsTab).toHaveAttribute("aria-selected", "true");
		expect(screen.getByRole("tabpanel")).toHaveAttribute("id", "medals");

		await user.keyboard("{Home}");
		expect(scheduleTab).toHaveFocus();
		expect(scheduleTab).toHaveAttribute("aria-selected", "true");
	});

	it("uses vertical orientation and Up/Down navigation when tabs are stacked on mobile", async () => {
		const user = userEvent.setup();
		const originalWidth = window.innerWidth;
		const mediaQueryLists: MediaQueryList[] = [];
		const originalMatchMedia = window.matchMedia.bind(window);
		const matchMediaSpy = vi
			.spyOn(window, "matchMedia")
			.mockImplementation((query) => {
				const mediaQueryList = originalMatchMedia(query);
				mediaQueryLists.push(mediaQueryList);
				return mediaQueryList;
			});
		window.innerWidth = 375;

		try {
			render(<App />);

			const tablist = screen.getByRole("tablist", { name: "Views" });
			const scheduleTab = screen.getByRole("tab", { name: "Schedule" });
			const resultsTab = screen.getByRole("tab", { name: "Results" });

			expect(tablist).toHaveAttribute("aria-orientation", "vertical");

			scheduleTab.focus();
			await user.keyboard("{ArrowDown}");

			expect(resultsTab).toHaveFocus();
			expect(resultsTab).toHaveAttribute("aria-selected", "true");

			await user.keyboard("{ArrowUp}");

			expect(scheduleTab).toHaveFocus();
			expect(scheduleTab).toHaveAttribute("aria-selected", "true");

			act(() => {
				window.innerWidth = originalWidth;
				window.dispatchEvent(new Event("resize"));
				for (const mediaQueryList of mediaQueryLists) {
					mediaQueryList.dispatchEvent(new Event("change"));
				}
			});

			expect(tablist).toHaveAttribute("aria-orientation", "horizontal");
			await user.keyboard("{ArrowRight}");
			expect(resultsTab).toHaveFocus();
		} finally {
			act(() => {
				window.innerWidth = originalWidth;
				window.dispatchEvent(new Event("resize"));
				for (const mediaQueryList of mediaQueryLists) {
					mediaQueryList.dispatchEvent(new Event("change"));
				}
			});
			matchMediaSpy.mockRestore();
		}
	});

	it("shows the medal ceremonies note when Medals is chosen", async () => {
		const user = userEvent.setup();
		render(<App />);

		await user.click(screen.getByRole("tab", { name: "Medals" }));

		expect(
			screen.getByText("Medal ceremonies are published after the final heat."),
		).toBeInTheDocument();
	});

	it("exposes each Heat card as a named disclosure with a unique controlled region", async () => {
		render(<App />);

		const articles = screen.getAllByRole("article");
		expect(articles).toHaveLength(3);
		expect(
			screen.getByRole("heading", { level: 2, name: "Heat 1" }),
		).toBeInTheDocument();

		const detailsButtons = screen.getAllByRole("button", {
			name: /^Details Heat \d+$/,
		});
		expect(detailsButtons).toHaveLength(3);

		const detailsIds = detailsButtons.map((button) => {
			expect(button).toHaveAttribute("aria-expanded", "false");
			expect(button).toHaveAccessibleName(/^Details Heat \d+$/);

			const detailsId = button.getAttribute("aria-controls");
			if (detailsId === null) {
				throw new Error(
					"Expected the Details button to control its detail content",
				);
			}

			const details = document.getElementById(detailsId);
			if (details === null) {
				throw new Error(
					"Expected aria-controls to reference existing detail content",
				);
			}

			expect(details).toHaveAttribute("hidden");
			expect(details).not.toBeVisible();
			return detailsId;
		});

		expect(new Set(detailsIds).size).toBe(3);
	});

	it("keeps the disclosure name stable as its detail content is expanded", async () => {
		const user = userEvent.setup();
		render(<App />);

		const heatOneDetails = screen.getByRole("button", {
			name: "Details Heat 1",
		});
		const detailsId = heatOneDetails.getAttribute("aria-controls");
		if (detailsId === null) {
			throw new Error(
				"Expected the Details button to control its detail content",
			);
		}
		const details = document.getElementById(detailsId);
		if (details === null) {
			throw new Error(
				"Expected aria-controls to reference existing detail content",
			);
		}

		expect(heatOneDetails).toHaveAttribute("aria-expanded", "false");
		expect(details).not.toBeVisible();

		await user.click(heatOneDetails);

		expect(heatOneDetails).toHaveAttribute("aria-expanded", "true");
		expect(heatOneDetails).toHaveAccessibleName("Details Heat 1");
		expect(details).toBeVisible();
		expect(details).toHaveTextContent("First run starts at 10:15.");
	});

	it("supports Enter and Space while keeping keyboard focus on the Details button", async () => {
		const user = userEvent.setup();
		render(<App />);

		const heatOneDetails = screen.getByRole("button", {
			name: "Details Heat 1",
		});
		heatOneDetails.focus();

		await user.keyboard("{Enter}");
		expect(heatOneDetails).toHaveAttribute("aria-expanded", "true");
		expect(document.activeElement).toBe(heatOneDetails);

		await user.keyboard(" ");
		expect(heatOneDetails).toHaveAttribute("aria-expanded", "false");
		expect(document.activeElement).toBe(heatOneDetails);
	});

	it("opens and closes alert preferences", async () => {
		const user = userEvent.setup();
		render(<App />);

		const manageAlertsButton = screen.getByRole("button", {
			name: "Manage alerts",
		});
		await user.click(manageAlertsButton);
		expect(
			screen.getByRole("dialog", { name: "Alert preferences" }),
		).toHaveAttribute("aria-modal", "true");
		expect(screen.getByText("Heat changes")).toBeInTheDocument();

		await user.click(screen.getByRole("button", { name: "Close" }));
		expect(screen.queryByText("Heat changes")).not.toBeInTheDocument();
		expect(manageAlertsButton).toHaveFocus();
	});

	it("keeps focus in the alert dialog and closes it with Escape", async () => {
		const user = userEvent.setup();
		render(<App />);

		await user.click(screen.getByRole("button", { name: "Manage alerts" }));
		const heatChanges = screen.getByRole("checkbox", { name: "Heat changes" });
		const medalCeremonies = screen.getByRole("checkbox", {
			name: "Medal ceremonies",
		});
		const closeButton = screen.getByRole("button", { name: "Close" });

		expect(
			screen.getByRole("dialog", { name: "Alert preferences" }),
		).toBeInTheDocument();
		expect(heatChanges).toHaveFocus();

		await user.tab();
		expect(medalCeremonies).toHaveFocus();
		await user.tab();
		expect(closeButton).toHaveFocus();
		await user.tab();
		expect(heatChanges).toHaveFocus();
		await user.tab({ shift: true });
		expect(closeButton).toHaveFocus();

		await user.keyboard("{Escape}");

		expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
		expect(screen.getByRole("button", { name: "Manage alerts" })).toHaveFocus();
	});

	it("moves through alert dialog controls with arrow keys and preserves checkbox activation", async () => {
		const user = userEvent.setup();
		render(<App />);

		await user.click(screen.getByRole("button", { name: "Manage alerts" }));
		const heatChanges = screen.getByRole("checkbox", { name: "Heat changes" });
		const medalCeremonies = screen.getByRole("checkbox", {
			name: "Medal ceremonies",
		});
		const closeButton = screen.getByRole("button", { name: "Close" });

		expect(heatChanges).toHaveFocus();

		await user.keyboard("{ArrowDown}");
		expect(medalCeremonies).toHaveFocus();

		await user.keyboard("{ArrowRight}");
		expect(closeButton).toHaveFocus();

		await user.keyboard("{ArrowDown}");
		expect(heatChanges).toHaveFocus();

		await user.keyboard("{ArrowUp}");
		expect(closeButton).toHaveFocus();

		await user.keyboard("{ArrowLeft}");
		expect(medalCeremonies).toHaveFocus();

		await user.keyboard(" ");
		expect(medalCeremonies).toBeChecked();
	});

	it("shows a confirmation when the share control is used", async () => {
		const user = userEvent.setup();
		render(<App />);

		await user.click(screen.getByRole("button", { name: "Copy link" }));

		expect(screen.getByText("Link copied")).toBeInTheDocument();
	});

	it("exposes the favorite control as a named toggle", async () => {
		const user = userEvent.setup();
		render(<App />);

		const favoriteButton = screen.getByRole("button", { name: "Favorite" });
		expect(favoriteButton).toHaveAttribute("aria-pressed", "false");

		await user.click(favoriteButton);

		expect(favoriteButton).toHaveAttribute("aria-pressed", "true");
		expect(favoriteButton).toHaveAccessibleName("Favorite");
	});
});
