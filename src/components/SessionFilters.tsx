import { useId } from "react";
import { css, cx } from "styled-system/css";
import { Flex } from "styled-system/jsx";

import { type SessionFilterId, sessionFilters } from "../data/fixtures";

export interface SessionFiltersProps {
	activeFilter: SessionFilterId;
	onFilterChange: (filter: SessionFilterId) => void;
}

const filterGroupClass = css({
	border: "none",
	m: "0",
	minWidth: "0",
	p: "0",
});

const visuallyHiddenClass = css({ srOnly: true });

const chipClass = css({
	alignItems: "center",
	bg: "surface.base",
	borderColor: "border.primary",
	borderRadius: "full",
	borderStyle: "solid",
	borderWidth: "xs",
	color: "text.primary",
	cursor: "pointer",
	display: "inline-flex",
	h: "10",
	px: "4",
	textStyle: "t_small",
	userSelect: "none",
	_hover: { bg: "surface.subtle" },
	_focusWithin: {
		outlineColor: "focus.default",
		outlineOffset: "0.125rem",
		outlineStyle: "solid",
		outlineWidth: "0.125rem",
	},
});

const selectedChipClass = css({
	bg: "surface.brand",
	borderColor: "border.brand",
	color: "text.on_brand",
	_hover: { bg: "action.brand_hover" },
});

export function SessionFilters({
	activeFilter,
	onFilterChange,
}: SessionFiltersProps) {
	const groupName = useId();

	return (
		<fieldset className={filterGroupClass}>
			<legend className={visuallyHiddenClass}>Filter sessions</legend>
			<Flex direction={{ base: "column", md: "row" }} gap="2">
				{sessionFilters.map((filter) => {
					const isSelected = filter.id === activeFilter;

					return (
						<label
							key={filter.id}
							className={cx(chipClass, isSelected && selectedChipClass)}
						>
							<input
								className={visuallyHiddenClass}
								type="radio"
								name={groupName}
								value={filter.id}
								checked={isSelected}
								onChange={() => onFilterChange(filter.id)}
							/>
							{filter.label}
						</label>
					);
				})}
			</Flex>
		</fieldset>
	);
}

SessionFilters.displayName = "SessionFilters";
