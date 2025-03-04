import { Token } from '..';

export interface InlineRule {
  name: string;
  test: RegExp;
  parse: (match: RegExpExecArray, level: number) => Token[];
}

export const boldRule: InlineRule = {
  name: 'bold',
  test: /\*\*([^*]+)\*\*/,
  parse: (match, level) => [
    {
      type: 'strong_open',
      tag: 'strong',
      attrs: null,
      map: null,
      nesting: 1,
      level,
      children: null,
      content: '',
      markup: '**',
      info: '',
      meta: null,
      block: false,
      hidden: false
    },
    {
      type: 'text',
      tag: '',
      attrs: null,
      map: null,
      nesting: 0,
      level: level + 1,
      children: null,
      content: match[1],
      markup: '',
      info: '',
      meta: null,
      block: false,
      hidden: false
    },
    {
      type: 'strong_close',
      tag: 'strong',
      attrs: null,
      map: null,
      nesting: -1,
      level,
      children: null,
      content: '',
      markup: '**',
      info: '',
      meta: null,
      block: false,
      hidden: false
    }
  ]
};

export const inlineRules: InlineRule[] = [
  boldRule,
  italicRule,
  strikethroughRule,
  linkRule,
  imageRule,
  quoteRule
];

export const italicRule: InlineRule = {
  name: 'italic',
  test: /\*([^*]+)\*/,
  parse: (match, level) => [
    {
      type: 'em_open',
      tag: 'em',
      attrs: null,
      map: null,
      nesting: 1,
      level,
      children: null,
      content: '',
      markup: '*',
      info: '',
      meta: null,
      block: false,
      hidden: false
    },
    {
      type: 'text',
      tag: '',
      attrs: null,
      map: null,
      nesting: 0,
      level: level + 1,
      children: null,
      content: match[1],
      markup: '',
      info: '',
      meta: null,
      block: false,
      hidden: false
    },
    {
      type: 'em_close',
      tag: 'em',
      attrs: null,
      map: null,
      nesting: -1,
      level,
      children: null,
      content: '',
      markup: '*',
      info: '',
      meta: null,
      block: false,
      hidden: false
    }
  ]
};

export const inlineRules: InlineRule[] = [
  boldRule,
  italicRule,
  strikethroughRule,
  linkRule,
  imageRule,
  quoteRule
];

export const strikethroughRule: InlineRule = {
  name: 'strikethrough',
  test: /~~([^~]+)~~/,
  parse: (match, level) => [
    {
      type: 'del_open',
      tag: 'del',
      attrs: null,
      map: null,
      nesting: 1,
      level,
      children: null,
      content: '',
      markup: '~~',
      info: '',
      meta: null,
      block: false,
      hidden: false
    },
    {
      type: 'text',
      tag: '',
      attrs: null,
      map: null,
      nesting: 0,
      level: level + 1,
      children: null,
      content: match[1],
      markup: '',
      info: '',
      meta: null,
      block: false,
      hidden: false
    },
    {
      type: 'del_close',
      tag: 'del',
      attrs: null,
      map: null,
      nesting: -1,
      level,
      children: null,
      content: '',
      markup: '~~',
      info: '',
      meta: null,
      block: false,
      hidden: false
    }
  ]
};

export const inlineRules: InlineRule[] = [
  boldRule,
  italicRule,
  strikethroughRule,
  linkRule,
  imageRule,
  quoteRule
];

export const linkRule: InlineRule = {
  name: 'link',
  test: /\[([^\]]+)\]\(([^\)]+)\)/,
  parse: (match, level) => [
    {
      type: 'link_open',
      tag: 'a',
      attrs: [['href', match[2]]],
      map: null,
      nesting: 1,
      level,
      children: null,
      content: '',
      markup: '',
      info: '',
      meta: null,
      block: false,
      hidden: false
    },
    {
      type: 'text',
      tag: '',
      attrs: null,
      map: null,
      nesting: 0,
      level: level + 1,
      children: null,
      content: match[1],
      markup: '',
      info: '',
      meta: null,
      block: false,
      hidden: false
    },
    {
      type: 'link_close',
      tag: 'a',
      attrs: null,
      map: null,
      nesting: -1,
      level,
      children: null,
      content: '',
      markup: '',
      info: '',
      meta: null,
      block: false,
      hidden: false
    }
  ]
};

export const inlineRules: InlineRule[] = [
  boldRule,
  italicRule,
  strikethroughRule,
  linkRule,
  imageRule,
  quoteRule
];

export const imageRule: InlineRule = {
  name: 'image',
  test: /!\[([^\]]+)\]\(([^\)]+)\)/,
  parse: (match, level) => [
    {
      type: 'image',
      tag: 'img',
      attrs: [
        ['src', match[2]],
        ['alt', match[1]]
      ],
      map: null,
      nesting: 0,
      level,
      children: null,
      content: '',
      markup: '!',
      info: '',
      meta: null,
      block: false,
      hidden: false
    }
  ]
};

export const inlineRules: InlineRule[] = [
  boldRule,
  italicRule,
  strikethroughRule,
  linkRule,
  imageRule,
  quoteRule
];

export const quoteRule: InlineRule = {
  name: 'quote',
  test: /^> (.+)$/,
  parse: (match, level) => [
    {
      type: 'blockquote_open',
      tag: 'blockquote',
      attrs: null,
      map: null,
      nesting: 1,
      level,
      children: null,
      content: '',
      markup: '>',
      info: '',
      meta: null,
      block: true,
      hidden: false
    },
    {
      type: 'text',
      tag: '',
      attrs: null,
      map: null,
      nesting: 0,
      level: level + 1,
      children: null,
      content: match[1],
      markup: '',
      info: '',
      meta: null,
      block: false,
      hidden: false
    },
    {
      type: 'blockquote_close',
      tag: 'blockquote',
      attrs: null,
      map: null,
      nesting: -1,
      level,
      children: null,
      content: '',
      markup: '>',
      info: '',
      meta: null,
      block: true,
      hidden: false
    }
  ]
};

export const inlineRules: InlineRule[] = [
  boldRule,
  italicRule,
  strikethroughRule,
  linkRule,
  imageRule,
  quoteRule
];