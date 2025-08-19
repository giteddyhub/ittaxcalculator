"use client";

import { ChangeEvent } from "react";

interface CheckboxProps {
	label: string;
	checked: boolean;
	onChange: (checked: boolean) => void;
	id?: string;
}

export function Checkbox({ label, checked, onChange, id }: CheckboxProps) {
	function handleChange(e: ChangeEvent<HTMLInputElement>) {
		onChange(e.target.checked);
	}

	return (
		<label className="inline-flex items-center gap-2 cursor-pointer select-none">
			<input
				id={id}
				type="checkbox"
				checked={checked}
				onChange={handleChange}
				className="peer sr-only"
			/>
			<span className="inline-flex h-5 w-5 items-center justify-center rounded-md border border-gray-300 bg-white transition peer-checked:border-gray-900 peer-checked:bg-gray-900">
				<svg
					className="h-3.5 w-3.5 text-white opacity-0 transition-opacity peer-checked:opacity-100"
					viewBox="0 0 20 20"
					fill="none"
					stroke="currentColor"
					strokeWidth="3"
					strokeLinecap="round"
					strokeLinejoin="round"
					aria-hidden
				>
					<path d="M4 11l4 4L16 7" />
				</svg>
			</span>
			<span className="text-sm text-gray-700">{label}</span>
		</label>
	);
}


