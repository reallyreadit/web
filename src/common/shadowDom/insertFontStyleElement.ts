interface Font {
	family: string,
	fileName: string
}
const defaultFonts = [
	{
		family: 'Cambria (bold)',
		fileName: 'cambria-bold.ttf'
	},
	{
		family: 'Cambria (regular)',
		fileName: 'cambria-regular.ttf'
	},
	{
		family: 'Museo Sans (100)',
		fileName: 'museo-sans-100.ttf'
	},
	{
		family: 'Museo Sans (300)',
		fileName: 'museo-sans-300.ttf'
	},
	{
		family: 'Museo Sans (500)',
		fileName: 'museo-sans-500.ttf'
	},
	{
		family: 'Museo Sans (700)',
		fileName: 'museo-sans-700.ttf'
	},
	{
		family: 'Museo Sans (900)',
		fileName: 'museo-sans-900.ttf'
	}
];
export default function insertFontStyleElement(
	fontDirectoryPath: string,
	additionalFonts: Font[] = []
) {
	const styleElement = document.createElement('style');
	styleElement.textContent = defaultFonts
		.concat(additionalFonts)
		.map(
			font => `@font-face { font-family: '${font.family}'; src: url('${fontDirectoryPath + font.fileName}'); }`
		)
		.join('\n');
	document.body.append(styleElement);
}