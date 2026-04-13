export interface SectionItem {
    heading: string;
    subSections?: { title: string; bullets: string[] }[];
    bullets?: string[];
    paragraph?: string;
}