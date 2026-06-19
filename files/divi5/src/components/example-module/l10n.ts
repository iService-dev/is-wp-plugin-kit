// Translation catalog for the Example Module (Builder + Front-End).
//
// Loaded into wp.i18n via setLocaleData() in index.ts, gated by the page
// language. Keys are the English source strings exactly as they appear in
// module.json / __() calls; values are the translations. Replace the German
// demo strings with your own catalog, or add more locales alongside `de`.

export const de: Record<string, unknown> = {
	'': { domain: 'messages', 'plural-forms': 'nplurals=2; plural=(n != 1);', lang: 'de_DE' },
	'IS Example Module': ['IS Beispiel-Modul'],
	'IS Example Modules': ['IS Beispiel-Module'],
	'Title': ['Titel'],
	'Input your title text here.': ['Gib hier deinen Titeltext ein.'],
	'Content': ['Inhalt'],
	'Input the main text content for your module here.': ['Gib hier den Hauptinhalt deines Moduls ein.'],
};
