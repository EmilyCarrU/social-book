# Emily Carr eBook Application

A prototype ebook for Emily Carr University’s Social + Interactive Media Centre.

## Running the ebook

This ebook is build with [Harp](http://harpjs.com), which uses Node.js. [Install Node.js](nodejs.org). It will come with npm, the Node Package Manager. [Open the terminal](http://wiseheartdesign.com/articles/2010/11/12/the-designers-guide-to-the-osx-command-prompt/), and you can install Harp using the following command:

```sh
npm install -g harp
```

Next, you can clone this repository locally:

```sh
# drag the location you want the project to be, into the terminal
cd ~/Sites/
git clone https://github.com/emilycarru/social-ebook
# this repo would now be in ~/Sites/social-ebook
```

You can now serve this project using Harp.

```sh
harp server social-ebook
# social-ebook is being served in your browser at http://localhost:9000
```

## Structure

The platform accommodates different kinds of books with commenting at multiple levels. The basic structure is as follows:

*Generic Book*

* Section
  * Chapter
      * Sub-Chapter

### Table of Contents

There is no explicit Table of Contents; the structure of the book _is_ the table of contents.

### Commenting

Comments may be made at either the Section, Chapter, or Sub-Chapter level. If commenting is permitted at the Section level, that book will have no Chapters or Sub-sections. If commenting is permitted at the Chapter level, that book will have no Sub-Chapters.

### Sections

_Sections are at the top level of the book’s content._

It is likely that most books linear books will only have one section. Books with multiple sections could include a play with acts, or a technical book with multiple major topics.

### Chapters

_Chapters are children of Sections._

### Sub-Chapters

_Sub-Chapters are children of Chapters._

Sub-Chapters may be any amount of content within a chapter. In some books, it could be appropriate to allow commenting at the paragraph level, so Sub-Chapters will be paragraphs.

In another book, an author may only want comments halfway through the book and at the end. Here, the first Sub-Chapter would be the first half of the book. The second Sub-Chapter would be the remainder of the chapter.

Sub-Chapters may also have commenting disabled. This way, an author could have comments enabled at the paragraph level, but only for specific paragraphs.

### Example

The following is an example of how _Frankenstein_ would work as a social book with comments at the paragraph level.

#### Frankenstein

1. Preface _Section_
  1. Foreward _Chapter_
      1. Paragraph 1 _Sub-Chapter_
      2. Paragraph 2
      3. Paragraph 3
      4. Paragraph 4
      5. Paragraph 5
  2. Letter I
  3. Letter II
  4. Letter III
  5. Letter IV
2. Part I _Section_
  1. Chapter 1 _Chapter_
      1. Paragraph 1 _Sub-Chapter_
      2. Paragraph 2
      3. Paragraph 3
      4. *and so on*
      10. Paragraph 10
  2. Chapter 2
  3. Chapter 3
  4. *and so on*
  12. Chapter 12
3. Part II _Section_
  1. Chapter 13 _Chapter_
      1. Paragraph 1 _Sub-Chapter_
      2. Paragraph 2
      3. Paragraph 3
      4. *and so on*
      22. Paragraph 22
  2. Chapter 14
  3. Chapter 15
  4. *and so on*
  12. Chapter 24
