import { type KeyboardEvent, useEffect, useId, useRef } from "react";
import { css } from "styled-system/css";
import { Stack } from "styled-system/jsx";

import { copy } from "../data/fixtures";

export interface AlertsModalProps {
	onClose: () => void;
}

const closeButtonClass = css({
	alignSelf: "flex-start",
	bg: "surface.base",
	borderColor: "border.primary",
	borderRadius: "md",
	borderStyle: "solid",
	borderWidth: "xs",
	color: "text.primary",
	cursor: "pointer",
	h: "10",
	px: "4",
	textStyle: "t_small_b",
	_hover: { bg: "surface.subtle" },
	_focusVisible: {
		outlineColor: "text.primary",
		outlineOffset: "0.125rem",
		outlineStyle: "solid",
		outlineWidth: "0.125rem",
	},
});

const checkboxClass = css({
	accentColor: "graphics.brand",
	h: "5",
	w: "5",
	_focusVisible: {
		outlineColor: "text.primary",
		outlineOffset: "0.125rem",
		outlineStyle: "solid",
		outlineWidth: "0.125rem",
	},
});

const labelClass = css({
	alignItems: "center",
	color: "text.primary",
	cursor: "pointer",
	display: "flex",
	gap: "3",
	textStyle: "t_medium",
});

export function AlertsModal({ onClose }: AlertsModalProps) {
	const heatChangesRef = useRef<HTMLInputElement>(null);
	const titleId = useId();

	useEffect(() => {
		const previouslyFocusedElement = document.activeElement;
		heatChangesRef.current?.focus();

		return () => {
			if (previouslyFocusedElement instanceof HTMLElement) {
				previouslyFocusedElement.focus();
			}
		};
	}, []);

	const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
		if (event.key === "Escape") {
			event.preventDefault();
			onClose();
			return;
		}

		const focusableElements = event.currentTarget.querySelectorAll<HTMLElement>(
			'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
		);

		const isForwardArrow =
			event.key === "ArrowDown" || event.key === "ArrowRight";
		const isBackwardArrow =
			event.key === "ArrowUp" || event.key === "ArrowLeft";
		if (isForwardArrow || isBackwardArrow) {
			if (focusableElements.length === 0) {
				return;
			}

			const activeElement = document.activeElement;
			const currentIndex =
				activeElement instanceof HTMLElement
					? Array.from(focusableElements).indexOf(activeElement)
					: -1;
			const direction = isForwardArrow ? 1 : -1;
			const nextIndex =
				currentIndex === -1
					? isForwardArrow
						? 0
						: focusableElements.length - 1
					: (currentIndex + direction + focusableElements.length) %
						focusableElements.length;

			event.preventDefault();
			focusableElements.item(nextIndex)?.focus();
			return;
		}

		if (event.key !== "Tab") {
			return;
		}

		const firstFocusableElement = focusableElements.item(0);
		const lastFocusableElement = focusableElements.item(
			focusableElements.length - 1,
		);

		if (event.shiftKey && document.activeElement === firstFocusableElement) {
			event.preventDefault();
			lastFocusableElement?.focus();
		} else if (
			!event.shiftKey &&
			document.activeElement === lastFocusableElement
		) {
			event.preventDefault();
			firstFocusableElement?.focus();
		}
	};

	return (
		<div
			className={css({
				alignItems: "center",
				bg: "surface.scrim",
				display: "flex",
				inset: "0",
				justifyContent: "center",
				p: "4",
				position: "fixed",
				zIndex: "10",
			})}
		>
			<div
				role="dialog"
				aria-modal="true"
				aria-labelledby={titleId}
				onKeyDown={handleKeyDown}
				className={css({
					bg: "surface.elevated",
					borderColor: "border.primary",
					borderRadius: "lg",
					borderStyle: "solid",
					borderWidth: "xs",
					color: "text.primary",
					maxW: "24rem",
					p: "6",
					w: "full",
				})}
			>
				<Stack gap="4">
					<h2
						id={titleId}
						className={css({ color: "text.primary", textStyle: "h_small" })}
					>
						{copy.alertTitle}
					</h2>
					<Stack gap="3">
						<label className={labelClass}>
							<input
								ref={heatChangesRef}
								type="checkbox"
								className={checkboxClass}
							/>
							{copy.heatChanges}
						</label>
						<label className={labelClass}>
							<input type="checkbox" className={checkboxClass} />
							{copy.medalCeremonies}
						</label>
					</Stack>
					<button type="button" className={closeButtonClass} onClick={onClose}>
						{copy.close}
					</button>
				</Stack>
			</div>
		</div>
	);
}

AlertsModal.displayName = "AlertsModal";
