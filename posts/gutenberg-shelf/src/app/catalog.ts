export type BookMotif =
  | "lattice"
  | "corrosion"
  | "efficiency"
  | "network"
  | "boom"
  | "organization"
  | "schematic"
  | "flight"
  | "circuit"
  | "orbit"
  | "branches"
  | "wave"
  | "runner"
  | "gather"
  | "maze"
  | "fracture"
  | "continuum"
  | "windows"
  | "steps";

export type CatalogBook = {
  id: string;
  title: string;
  shortTitle: string;
  author: string;
  description: string;
  quote: string;
  quoteBy: string;
  format: string;
  availability: string;
  url: string;
  cover: string;
  accent: string;
  ink: string;
  motif: BookMotif;
  height: number;
  thickness: number;
  /**
   * Optional browser URL for contributor-owned front-cover art. Put local
   * images under `public/books/<id>/` and use a URL such as
   * `/books/<id>/cover.webp`.
   */
  coverImage?: string;
  gutenbergId?: number;
  linkLabel?: string;
  living?: boolean;
};

export const catalog: CatalogBook[] = ([

  {
    "id": "moby-dick-or-the-whale-1",
    "title": "Moby Dick; Or, The Whale",
    "shortTitle": "Moby Dick",
    "author": "Melville, Herman (1819 to 1891)",
    "description": "Catalog subjects: Adventure stories; Ahab, Captain (Fictitious character) -- Fiction; Mentally ill -- Fiction.",
    "quote": "",
    "quoteBy": "",
    "format": "Free ebook, Project Gutenberg number 2701",
    "availability": "160,099 downloads in the last 30 days",
    "url": "https://www.gutenberg.org/ebooks/2701",
    "linkLabel": "Read at gutenberg.org",
    "cover": "#2b1f1c",
    "accent": "#c9873f",
    "ink": "#f3e7d2",
    "motif": "efficiency",
    "height": 1.93,
    "thickness": 0.29,
    "gutenbergId": 2701,
    "coverImage": "/vibelogs/posts/gutenberg-shelf/books/moby-dick-or-the-whale-1/cover.webp"
  },
  {
    "id": "pride-and-prejudice-2",
    "title": "Pride and Prejudice",
    "shortTitle": "Pride and Prejudice",
    "author": "Austen, Jane (1775 to 1817)",
    "description": "Catalog subjects: Courtship -- Fiction; Domestic fiction; England -- Fiction.",
    "quote": "",
    "quoteBy": "",
    "format": "Free ebook, Project Gutenberg number 1342",
    "availability": "136,926 downloads in the last 30 days",
    "url": "https://www.gutenberg.org/ebooks/1342",
    "linkLabel": "Read at gutenberg.org",
    "cover": "#1c304b",
    "accent": "#c9a227",
    "ink": "#f1e7d4",
    "motif": "circuit",
    "height": 2.11,
    "thickness": 0.273,
    "gutenbergId": 1342,
    "coverImage": "/vibelogs/posts/gutenberg-shelf/books/pride-and-prejudice-2/cover.webp"
  },
  {
    "id": "romeo-and-juliet-3",
    "title": "Romeo and Juliet",
    "shortTitle": "Romeo and Juliet",
    "author": "Shakespeare, William (1564 to 1616)",
    "description": "Catalog subjects: Conflict of generations -- Drama; Juliet (Fictitious character) -- Drama; Romeo (Fictitious character) -- Drama.",
    "quote": "",
    "quoteBy": "",
    "format": "Free ebook, Project Gutenberg number 1513",
    "availability": "103,120 downloads in the last 30 days",
    "url": "https://www.gutenberg.org/ebooks/1513",
    "linkLabel": "Read at gutenberg.org",
    "cover": "#26372c",
    "accent": "#c3854a",
    "ink": "#eee5d2",
    "motif": "circuit",
    "height": 1.93,
    "thickness": 0.247,
    "gutenbergId": 1513,
    "coverImage": "/vibelogs/posts/gutenberg-shelf/books/romeo-and-juliet-3/cover.webp"
  },
  {
    "id": "a-room-with-a-view-4",
    "title": "A Room with a View",
    "shortTitle": "A Room with a View",
    "author": "Forster, E. M. (Edward Morgan) (1879 to 1970)",
    "description": "Catalog subjects: British -- Italy -- Fiction; England -- Fiction; Florence (Italy) -- Fiction.",
    "quote": "",
    "quoteBy": "",
    "format": "Free ebook, Project Gutenberg number 2641",
    "availability": "101,658 downloads in the last 30 days",
    "url": "https://www.gutenberg.org/ebooks/2641",
    "linkLabel": "Read at gutenberg.org",
    "cover": "#3a2440",
    "accent": "#d0a04b",
    "ink": "#f2e6d6",
    "motif": "lattice",
    "height": 2.14,
    "thickness": 0.246,
    "gutenbergId": 2641,
    "coverImage": "/vibelogs/posts/gutenberg-shelf/books/a-room-with-a-view-4/cover.webp"
  },
  {
    "id": "crime-and-punishment-5",
    "title": "Crime and Punishment",
    "shortTitle": "Crime and Punishment",
    "author": "Dostoyevsky, Fyodor (1821 to 1881)",
    "description": "Catalog subjects: Crime -- Psychological aspects -- Fiction; Detective and mystery stories; Murder -- Fiction.",
    "quote": "",
    "quoteBy": "",
    "format": "Free ebook, Project Gutenberg number 2554",
    "availability": "93,752 downloads in the last 30 days",
    "url": "https://www.gutenberg.org/ebooks/2554",
    "linkLabel": "Read at gutenberg.org",
    "cover": "#4a2b1c",
    "accent": "#d9b26a",
    "ink": "#f5ead6",
    "motif": "steps",
    "height": 2.08,
    "thickness": 0.24,
    "gutenbergId": 2554,
    "coverImage": "/vibelogs/posts/gutenberg-shelf/books/crime-and-punishment-5/cover.webp"
  },
  {
    "id": "alice-s-adventures-in-wonderland-6",
    "title": "Alice's Adventures in Wonderland",
    "shortTitle": "Alice's Adventures in Wo...",
    "author": "Carroll, Lewis (1832 to 1898)",
    "description": "Catalog subjects: Alice (Fictitious character from Carroll) -- Juvenile fiction; Children's stories; Fantasy fiction.",
    "quote": "",
    "quoteBy": "",
    "format": "Free ebook, Project Gutenberg number 11",
    "availability": "82,955 downloads in the last 30 days",
    "url": "https://www.gutenberg.org/ebooks/11",
    "linkLabel": "Read at gutenberg.org",
    "cover": "#1f2a33",
    "accent": "#8fb0a8",
    "ink": "#eef0e9",
    "motif": "corrosion",
    "height": 2.03,
    "thickness": 0.232,
    "gutenbergId": 11,
    "coverImage": "/vibelogs/posts/gutenberg-shelf/books/alice-s-adventures-in-wonderland-6/cover.webp"
  },
  {
    "id": "the-count-of-monte-cristo-7",
    "title": "The Count of Monte Cristo",
    "shortTitle": "The Count of Monte Cristo",
    "author": "Dumas, Alexandre (1802 to 1870)",
    "description": "Catalog subjects: Adventure stories; Dantès, Edmond (Fictitious character) -- Fiction; France -- History -- 19th century -- Fiction.",
    "quote": "",
    "quoteBy": "",
    "format": "Free ebook, Project Gutenberg number 1184",
    "availability": "77,916 downloads in the last 30 days",
    "url": "https://www.gutenberg.org/ebooks/1184",
    "linkLabel": "Read at gutenberg.org",
    "cover": "#4b2333",
    "accent": "#d78a8a",
    "ink": "#f6e8e2",
    "motif": "boom",
    "height": 2.15,
    "thickness": 0.228,
    "gutenbergId": 1184,
    "coverImage": "/vibelogs/posts/gutenberg-shelf/books/the-count-of-monte-cristo-7/cover.webp"
  },
  {
    "id": "the-love-letters-of-mary-wollstonecraft-8",
    "title": "The Love Letters of Mary Wollstonecraft to Gilbert Imlay",
    "shortTitle": "The Love Letters of Mary...",
    "author": "Wollstonecraft, Mary (1759 to 1797)",
    "description": "Catalog subjects: Authors, English -- 18th century -- Correspondence; Feminists -- Great Britain -- Correspondence; Imlay, Gilbert, 1754?-1828? -- Correspondence.",
    "quote": "",
    "quoteBy": "",
    "format": "Free ebook, Project Gutenberg number 34413",
    "availability": "77,483 downloads in the last 30 days",
    "url": "https://www.gutenberg.org/ebooks/34413",
    "linkLabel": "Read at gutenberg.org",
    "cover": "#173d3c",
    "accent": "#c8a45c",
    "ink": "#eae4d2",
    "motif": "orbit",
    "height": 2.07,
    "thickness": 0.228,
    "gutenbergId": 34413,
    "coverImage": "/vibelogs/posts/gutenberg-shelf/books/the-love-letters-of-mary-wollstonecraft-8/cover.webp"
  },
  {
    "id": "carmen-9",
    "title": "Carmen",
    "shortTitle": "Carmen",
    "author": "Mérimée, Prosper (1803 to 1870)",
    "description": "Catalog subjects: Carmen (Fictitious character) -- Fiction; Spain -- Social life and customs -- 19th century -- Fiction.",
    "quote": "",
    "quoteBy": "",
    "format": "Free ebook, Project Gutenberg number 2465",
    "availability": "76,803 downloads in the last 30 days",
    "url": "https://www.gutenberg.org/ebooks/2465",
    "linkLabel": "Read at gutenberg.org",
    "cover": "#503a18",
    "accent": "#e0c07a",
    "ink": "#f7efdc",
    "motif": "network",
    "height": 2.0,
    "thickness": 0.228,
    "gutenbergId": 2465,
    "coverImage": "/vibelogs/posts/gutenberg-shelf/books/carmen-9/cover.webp"
  },
  {
    "id": "the-extraordinary-adventures-of-ars-ne-l-10",
    "title": "The Extraordinary Adventures of Arsène Lupin, Gentleman-Burglar",
    "shortTitle": "The Extraordinary Advent...",
    "author": "Leblanc, Maurice (1864 to 1941)",
    "description": "Catalog subjects: Adventure stories, French -- Translations into English; Burglars -- Fiction; Lupin, Arsène (Fictitious character) -- Fiction.",
    "quote": "",
    "quoteBy": "",
    "format": "Free ebook, Project Gutenberg number 6133",
    "availability": "75,744 downloads in the last 30 days",
    "url": "https://www.gutenberg.org/ebooks/6133",
    "linkLabel": "Read at gutenberg.org",
    "cover": "#232741",
    "accent": "#9aa8d8",
    "ink": "#ece9f2",
    "motif": "branches",
    "height": 1.96,
    "thickness": 0.227,
    "gutenbergId": 6133,
    "coverImage": "/vibelogs/posts/gutenberg-shelf/books/the-extraordinary-adventures-of-ars-ne-l-10/cover.webp"
  },
  {
    "id": "middlemarch-11",
    "title": "Middlemarch",
    "shortTitle": "Middlemarch",
    "author": "Eliot, George (1819 to 1880)",
    "description": "Catalog subjects: Bildungsromans; City and town life -- Fiction; Didactic fiction.",
    "quote": "",
    "quoteBy": "",
    "format": "Free ebook, Project Gutenberg number 145",
    "availability": "75,709 downloads in the last 30 days",
    "url": "https://www.gutenberg.org/ebooks/145",
    "linkLabel": "Read at gutenberg.org",
    "cover": "#2b1f1c",
    "accent": "#c9873f",
    "ink": "#f3e7d2",
    "motif": "circuit",
    "height": 2.02,
    "thickness": 0.227,
    "gutenbergId": 145,
    "coverImage": "/vibelogs/posts/gutenberg-shelf/books/middlemarch-11/cover.webp"
  },
  {
    "id": "frankenstein-or-the-modern-prometheus-12",
    "title": "Frankenstein; or, the modern prometheus",
    "shortTitle": "Frankenstein",
    "author": "Shelley, Mary Wollstonecraft (1797 to 1851)",
    "description": "Catalog subjects: Frankenstein's monster (Fictitious character) -- Fiction; Frankenstein, Victor (Fictitious character) -- Fiction; Gothic fiction.",
    "quote": "",
    "quoteBy": "",
    "format": "Free ebook, Project Gutenberg number 84",
    "availability": "75,458 downloads in the last 30 days",
    "url": "https://www.gutenberg.org/ebooks/84",
    "linkLabel": "Read at gutenberg.org",
    "cover": "#1c304b",
    "accent": "#c9a227",
    "ink": "#f1e7d4",
    "motif": "steps",
    "height": 1.95,
    "thickness": 0.227,
    "gutenbergId": 84,
    "coverImage": "/vibelogs/posts/gutenberg-shelf/books/frankenstein-or-the-modern-prometheus-12/cover.webp"
  },
  {
    "id": "the-blue-castle-a-novel-13",
    "title": "The Blue Castle: a novel",
    "shortTitle": "The Blue Castle",
    "author": "Montgomery, L. M. (Lucy Maud) (1874 to 1942)",
    "description": "Catalog subjects: Canada -- History -- 1914-1945 -- Fiction; Choice (Psychology) -- Fiction; Love -- Fiction.",
    "quote": "",
    "quoteBy": "",
    "format": "Free ebook, Project Gutenberg number 67979",
    "availability": "74,985 downloads in the last 30 days",
    "url": "https://www.gutenberg.org/ebooks/67979",
    "linkLabel": "Read at gutenberg.org",
    "cover": "#26372c",
    "accent": "#c3854a",
    "ink": "#eee5d2",
    "motif": "windows",
    "height": 2.12,
    "thickness": 0.226,
    "gutenbergId": 67979,
    "coverImage": "/vibelogs/posts/gutenberg-shelf/books/the-blue-castle-a-novel-13/cover.webp"
  },
  {
    "id": "the-complete-works-of-william-shakespear-14",
    "title": "The Complete Works of William Shakespeare",
    "shortTitle": "The Complete Works of Wi...",
    "author": "Shakespeare, William (1564 to 1616)",
    "description": "Catalog subjects: English drama -- Early modern and Elizabethan, 1500-1600.",
    "quote": "",
    "quoteBy": "",
    "format": "Free ebook, Project Gutenberg number 100",
    "availability": "74,616 downloads in the last 30 days",
    "url": "https://www.gutenberg.org/ebooks/100",
    "linkLabel": "Read at gutenberg.org",
    "cover": "#3a2440",
    "accent": "#d0a04b",
    "ink": "#f2e6d6",
    "motif": "continuum",
    "height": 2.11,
    "thickness": 0.226,
    "gutenbergId": 100,
    "coverImage": "/vibelogs/posts/gutenberg-shelf/books/the-complete-works-of-william-shakespear-14/cover.webp"
  },
  {
    "id": "sense-and-sensibility-15",
    "title": "Sense and Sensibility",
    "shortTitle": "Sense and Sensibility",
    "author": "Austen, Jane (1775 to 1817)",
    "description": "Catalog subjects: Domestic fiction; England -- Fiction; England -- Social life and customs -- 19th century -- Fiction.",
    "quote": "",
    "quoteBy": "",
    "format": "Free ebook, Project Gutenberg number 21839",
    "availability": "73,937 downloads in the last 30 days",
    "url": "https://www.gutenberg.org/ebooks/21839",
    "linkLabel": "Read at gutenberg.org",
    "cover": "#4a2b1c",
    "accent": "#d9b26a",
    "ink": "#f5ead6",
    "motif": "steps",
    "height": 2.15,
    "thickness": 0.225,
    "gutenbergId": 21839,
    "coverImage": "/vibelogs/posts/gutenberg-shelf/books/sense-and-sensibility-15/cover.webp"
  },
  {
    "id": "the-adventures-of-sherlock-holmes-16",
    "title": "The Adventures of Sherlock Holmes",
    "shortTitle": "The Adventures of Sherlo...",
    "author": "Doyle, Arthur Conan (1859 to 1930)",
    "description": "Catalog subjects: Detective and mystery stories, English; Holmes, Sherlock (Fictitious character) -- Fiction; Private investigators -- England -- Fiction.",
    "quote": "",
    "quoteBy": "",
    "format": "Free ebook, Project Gutenberg number 1661",
    "availability": "70,250 downloads in the last 30 days",
    "url": "https://www.gutenberg.org/ebooks/1661",
    "linkLabel": "Read at gutenberg.org",
    "cover": "#1f2a33",
    "accent": "#8fb0a8",
    "ink": "#eef0e9",
    "motif": "steps",
    "height": 2.06,
    "thickness": 0.223,
    "gutenbergId": 1661,
    "coverImage": "/vibelogs/posts/gutenberg-shelf/books/the-adventures-of-sherlock-holmes-16/cover.webp"
  },
  {
    "id": "my-life-volume-1-17",
    "title": "My Life  --  Volume 1",
    "shortTitle": "My Life  --  Volume 1",
    "author": "Wagner, Richard (1813 to 1883)",
    "description": "Catalog subjects: Composers -- Germany -- Biography; Wagner, Richard, 1813-1883.",
    "quote": "",
    "quoteBy": "",
    "format": "Free ebook, Project Gutenberg number 5197",
    "availability": "68,850 downloads in the last 30 days",
    "url": "https://www.gutenberg.org/ebooks/5197",
    "linkLabel": "Read at gutenberg.org",
    "cover": "#4b2333",
    "accent": "#d78a8a",
    "ink": "#f6e8e2",
    "motif": "gather",
    "height": 2.05,
    "thickness": 0.222,
    "gutenbergId": 5197,
    "coverImage": "/vibelogs/posts/gutenberg-shelf/books/my-life-volume-1-17/cover.webp"
  },
  {
    "id": "jane-eyre-an-autobiography-18",
    "title": "Jane Eyre: An Autobiography",
    "shortTitle": "Jane Eyre",
    "author": "Brontë, Charlotte (1816 to 1855)",
    "description": "Catalog subjects: Bildungsromans; Charity-schools -- Fiction; Country homes -- Fiction.",
    "quote": "",
    "quoteBy": "",
    "format": "Free ebook, Project Gutenberg number 1260",
    "availability": "67,570 downloads in the last 30 days",
    "url": "https://www.gutenberg.org/ebooks/1260",
    "linkLabel": "Read at gutenberg.org",
    "cover": "#173d3c",
    "accent": "#c8a45c",
    "ink": "#eae4d2",
    "motif": "boom",
    "height": 2.1,
    "thickness": 0.221,
    "gutenbergId": 1260,
    "coverImage": "/vibelogs/posts/gutenberg-shelf/books/jane-eyre-an-autobiography-18/cover.webp"
  },
  {
    "id": "little-women-or-meg-jo-beth-and-amy-19",
    "title": "Little Women; Or, Meg, Jo, Beth, and Amy",
    "shortTitle": "Little Women",
    "author": "Alcott, Louisa May (1832 to 1888)",
    "description": "Catalog subjects: Autobiographical fiction; Bildungsromans; Domestic fiction.",
    "quote": "",
    "quoteBy": "",
    "format": "Free ebook, Project Gutenberg number 37106",
    "availability": "66,277 downloads in the last 30 days",
    "url": "https://www.gutenberg.org/ebooks/37106",
    "linkLabel": "Read at gutenberg.org",
    "cover": "#503a18",
    "accent": "#e0c07a",
    "ink": "#f7efdc",
    "motif": "runner",
    "height": 2.0,
    "thickness": 0.22,
    "gutenbergId": 37106,
    "coverImage": "/vibelogs/posts/gutenberg-shelf/books/little-women-or-meg-jo-beth-and-amy-19/cover.webp"
  },
  {
    "id": "the-lady-of-the-lake-20",
    "title": "The Lady of the Lake",
    "shortTitle": "The Lady of the Lake",
    "author": "Scott, Walter (1771 to 1832)",
    "description": "Catalog subjects: Arthurian romances; Lady of the Lake (Legendary character) -- Romances.",
    "quote": "",
    "quoteBy": "",
    "format": "Free ebook, Project Gutenberg number 3011",
    "availability": "65,496 downloads in the last 30 days",
    "url": "https://www.gutenberg.org/ebooks/3011",
    "linkLabel": "Read at gutenberg.org",
    "cover": "#232741",
    "accent": "#9aa8d8",
    "ink": "#ece9f2",
    "motif": "schematic",
    "height": 2.06,
    "thickness": 0.219,
    "gutenbergId": 3011,
    "coverImage": "/vibelogs/posts/gutenberg-shelf/books/the-lady-of-the-lake-20/cover.webp"
  }
] satisfies CatalogBook[]).sort(
  (left, right) => right.height - left.height,
);
