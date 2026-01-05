import type Highlight from 'svelte-highlight';
import json from 'svelte-highlight/languages/json';
import yaml from 'svelte-highlight/languages/yaml';
import bash from 'svelte-highlight/languages/bash';

export const languages = { json, yaml, bash };

export type Langs = keyof typeof languages;

export interface Props extends Omit<Highlight, 'language' | 'code'> {
	code: string;
	lang: Langs;
	class?: string;
	title?: string;
}
