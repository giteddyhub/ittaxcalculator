"use client";

import { ChangeEvent } from "react";

interface SwitchProps {
	label: string;
	checked: boolean;
	onChange: (checked: boolean) => void;
	id?: string;
}

export function Switch({ label, checked, onChange, id }: SwitchProps) {
	function handleChange(e: ChangeEvent<HTMLInputElement>) {
		onChange(e.target.checked);
	}

	return (
		<label className="inline-flex items-center gap-3 cursor-pointer select-none">
			<span className="relative inline-flex h-5 w-9 items-center rounded-full transition-colors border border-gray-300 bg-gray-200 p-[2px] peer-checked:bg-gray-900 peer-checked:border-gray-900">
				<input
					id={id}
					type="checkbox"
					checked={checked}
					onChange={handleChange}
					className="peer sr-only"
				/>

				<span
					className="pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-all ml-0 peer-checked:ml-auto"
				/>
			</span>
			<span className="text-sm text-gray-700">{label}</span>
		</label>
	);
}


