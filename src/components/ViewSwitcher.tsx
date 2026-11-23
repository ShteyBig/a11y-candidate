import {
	type KeyboardEvent,
	type MouseEvent,
	useEffect,
	useState,
} from "react";
import { css } from "styled-system/css";

import { type ViewId, type ViewOption, views } from "../data/fixtures";

const desktopTablistQuery = "(min-width: 64rem)";

export interface ViewSwitcherProps {
	activeView: ViewId;
	onViewChange: (view: ViewId) => void;
}

const tabClass = css({
	alignItems: "center",
	bg: "transparent",
	border: "none",
	borderBottomColor: "transparent",
	borderBottomStyle: "solid",
	borderBottomWidth: "sm",
	color: "text.primary",
	cursor: "pointer",
	display: "inline-flex",
	px: "4",
	py: "2",
	textDecoration: "none",
	textStyle: "t_small_b",
	_hover: { color: "text.link_hover" },
	"&[aria-selected=true]": {
		borderBottomColor: "border.selected",
		color: "text.selected",
	},
	_focusVisible: {
		outlineColor: "focus.default",
		outlineOffset: "0.125rem",
		outlineStyle: "solid",
		outlineWidth: "0.125rem",
	},
});

export function ViewSwitcher({ activeView, onViewChange }: ViewSwitcherProps) {
	const [isVertical, setIsVertical] = useState(() => {
		return (
			typeof window.matchMedia !== "function" ||
			!window.matchMedia(desktopTablistQuery).matches
		);
	});

	useEffect(() => {
		if (typeof window.matchMedia !== "function") {
			return;
		}

		const desktopTablist = window.matchMedia(desktopTablistQuery);
		const updateOrientation = () => {
			setIsVertical(!desktopTablist.matches);
		};

		updateOrientation();
		desktopTablist.addEventListener("change", updateOrientation);
		window.addEventListener("resize", updateOrientation);
		return () => {
			desktopTablist.removeEventListener("change", updateOrientation);
			window.removeEventListener("resize", updateOrientation);
		};
	}, []);

	const handleSelect = (event: MouseEvent<HTMLAnchorElement>, view: ViewId) => {
		event.preventDefault();
		onViewChange(view);
	};

	const handleKeyDown = (
		event: KeyboardEvent<HTMLAnchorElement>,
		view: ViewId,
	) => {
		const currentIndex = views.findIndex((option) => option.id === view);
		let nextIndex: number;

		if (event.key === "Home") {
			nextIndex = 0;
		} else if (event.key === "End") {
			nextIndex = views.length - 1;
		} else if (
			(isVertical && event.key === "ArrowDown") ||
			(!isVertical && event.key === "ArrowRight")
		) {
			nextIndex = (currentIndex + 1) % views.length;
		} else if (
			(isVertical && event.key === "ArrowUp") ||
			(!isVertical && event.key === "ArrowLeft")
		) {
			nextIndex = (currentIndex - 1 + views.length) % views.length;
		} else {
			return;
		}

		event.preventDefault();
		const nextView = views[nextIndex];
		if (nextView === undefined) {
			return;
		}

		onViewChange(nextView.id);
		event.currentTarget.parentElement
			?.querySelectorAll<HTMLAnchorElement>('[role="tab"]')
			.item(nextIndex)
			?.focus();
	};

	return (
		<div
			role="tablist"
			aria-label="Views"
			aria-orientation={isVertical ? "vertical" : "horizontal"}
			className={css({
				borderBottomColor: "border.secondary",
				borderBottomStyle: "solid",
				borderBottomWidth: "xs",
				display: "flex",
				flexDirection: { base: "column", md: "row" },
				gap: "2",
			})}
		>
			{views.map((view: ViewOption) => {
				const panelId = view.href.slice(1);
				const isSelected = view.id === activeView;

				return (
					<a
						key={view.id}
						id={`${panelId}-tab`}
						href={view.href}
						role="tab"
						aria-selected={isSelected}
						aria-controls={panelId}
						tabIndex={isSelected ? 0 : -1}
						className={tabClass}
						onClick={(event) => handleSelect(event, view.id)}
						onKeyDown={(event) => handleKeyDown(event, view.id)}
					>
						{view.label}
					</a>
				);
			})}
		</div>
	);
}

ViewSwitcher.displayName = "ViewSwitcher";
