import { Token } from '..';

export interface BlockRule {
  name: string;
  test: RegExp;
  parse: (match: RegExpExecArray, level: number) => Token[];
}

export const listRule: BlockRule = {
  name: 'list',
  test: /^([-*+]|\d+\.)\s+(.+)$/,
  parse: (match, level) => {
    const isOrdered = /\d/.test(match[1]);
    return [
      {
        type: `${isOrdered ? 'ordered' : 'bullet'}_list_open`,
        tag: isOrdered ? 'ol' : 'ul',
        attrs: null,
        map: null,
        nesting: 1,
        level,
        children: null,
        content: '',
        markup: match[1],
        info: '',
        meta: null,
        block: true,
        hidden: false
      },
      {
        type: 'list_item_open',
        tag: 'li',
        attrs: null,
        map: null,
        nesting: 1,
        level: level + 1,
        children: null,
        content: '',
        markup: match[1],
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
        level: level + 2,
        children: null,
        content: match[2],
        markup: '',
        info: '',
        meta: null,
        block: false,
        hidden: false
      },
      {
        type: 'list_item_close',
        tag: 'li',
        attrs: null,
        map: null,
        nesting: -1,
        level: level + 1,
        children: null,
        content: '',
        markup: match[1],
        info: '',
        meta: null,
        block: true,
        hidden: false
      },
      {
        type: `${isOrdered ? 'ordered' : 'bullet'}_list_close`,
        tag: isOrdered ? 'ol' : 'ul',
        attrs: null,
        map: null,
        nesting: -1,
        level,
        children: null,
        content: '',
        markup: match[1],
        info: '',
        meta: null,
        block: true,
        hidden: false
      }
    ];
  }
};

export const blockquoteRule: BlockRule = {
  name: 'blockquote',
  test: /^>\s+(.+)$/,
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

export const codeBlockRule: BlockRule = {
  name: 'code_block',
  test: /^```(\w*)\n([\s\S]*?)\n```$/,
  parse: (match, level) => [
    {
      type: 'code_block',
      tag: 'pre',
      attrs: [
        ['class', `language-${match[1] || 'text'}`]
      ],
      map: null,
      nesting: 0,
      level,
      children: null,
      content: match[2],
      markup: '```',
      info: match[1],
      meta: null,
      block: true,
      hidden: false
    }
  ]
};

export const tableRule: BlockRule = {
  name: 'table',
  test: /^\|(.+)\|\s*\n\|\s*[-:]+[-| :]*\|\s*\n((\|.+\|\s*\n)+)/,
  parse: (match, level) => {
    const headers = match[1].split('|').map(s => s.trim()).filter(Boolean);
    const rows = match[2].trim().split('\n').map(row =>
      row.split('|').map(s => s.trim()).filter(Boolean)
    );

    const tokens: Token[] = [
      {
        type: 'table_open',
        tag: 'table',
        attrs: null,
        map: null,
        nesting: 1,
        level,
        children: null,
        content: '',
        markup: '',
        info: '',
        meta: null,
        block: true,
        hidden: false
      }
    ];

    // Add headers
    tokens.push({
      type: 'thead_open',
      tag: 'thead',
      attrs: null,
      map: null,
      nesting: 1,
      level: level + 1,
      children: null,
      content: '',
      markup: '',
      info: '',
      meta: null,
      block: true,
      hidden: false
    });

    tokens.push({
      type: 'tr_open',
      tag: 'tr',
      attrs: null,
      map: null,
      nesting: 1,
      level: level + 2,
      children: null,
      content: '',
      markup: '',
      info: '',
      meta: null,
      block: true,
      hidden: false
    });

    headers.forEach(header => {
      tokens.push({
        type: 'th_open',
        tag: 'th',
        attrs: null,
        map: null,
        nesting: 1,
        level: level + 3,
        children: null,
        content: '',
        markup: '',
        info: '',
        meta: null,
        block: true,
        hidden: false
      });

      tokens.push({
        type: 'text',
        tag: '',
        attrs: null,
        map: null,
        nesting: 0,
        level: level + 4,
        children: null,
        content: header,
        markup: '',
        info: '',
        meta: null,
        block: false,
        hidden: false
      });

      tokens.push({
        type: 'th_close',
        tag: 'th',
        attrs: null,
        map: null,
        nesting: -1,
        level: level + 3,
        children: null,
        content: '',
        markup: '',
        info: '',
        meta: null,
        block: true,
        hidden: false
      });
    });

    tokens.push({
      type: 'tr_close',
      tag: 'tr',
      attrs: null,
      map: null,
      nesting: -1,
      level: level + 2,
      children: null,
      content: '',
      markup: '',
      info: '',
      meta: null,
      block: true,
      hidden: false
    });

    tokens.push({
      type: 'thead_close',
      tag: 'thead',
      attrs: null,
      map: null,
      nesting: -1,
      level: level + 1,
      children: null,
      content: '',
      markup: '',
      info: '',
      meta: null,
      block: true,
      hidden: false
    });

    // Add rows
    tokens.push({
      type: 'tbody_open',
      tag: 'tbody',
      attrs: null,
      map: null,
      nesting: 1,
      level: level + 1,
      children: null,
      content: '',
      markup: '',
      info: '',
      meta: null,
      block: true,
      hidden: false
    });

    rows.forEach(row => {
      tokens.push({
        type: 'tr_open',
        tag: 'tr',
        attrs: null,
        map: null,
        nesting: 1,
        level: level + 2,
        children: null,
        content: '',
        markup: '',
        info: '',
        meta: null,
        block: true,
        hidden: false
      });

      row.forEach(cell => {
        tokens.push({
          type: 'td_open',
          tag: 'td',
          attrs: null,
          map: null,
          nesting: 1,
          level: level + 3,
          children: null,
          content: '',
          markup: '',
          info: '',
          meta: null,
          block: true,
          hidden: false
        });

        tokens.push({
          type: 'text',
          tag: '',
          attrs: null,
          map: null,
          nesting: 0,
          level: level + 4,
          children: null,
          content: cell,
          markup: '',
          info: '',
          meta: null,
          block: false,
          hidden: false
        });

        tokens.push({
          type: 'td_close',
          tag: 'td',
          attrs: null,
          map: null,
          nesting: -1,
          level: level + 3,
          children: null,
          content: '',
          markup: '',
          info: '',
          meta: null,
          block: true,
          hidden: false
        });
      });

      tokens.push({
        type: 'tr_close',
        tag: 'tr',
        attrs: null,
        map: null,
        nesting: -1,
        level: level + 2,
        children: null,
        content: '',
        markup: '',
        info: '',
        meta: null,
        block: true,
        hidden: false
      });
    });

    tokens.push({
      type: 'tbody_close',
      tag: 'tbody',
      attrs: null,
      map: null,
      nesting: -1,
      level: level + 1,
      children: null,
      content: '',
      markup: '',
      info: '',
      meta: null,
      block: true,
      hidden: false
    });

    tokens.push({
      type: 'table_close',
      tag: 'table',
      attrs: null,
      map: null,
      nesting: -1,
      level,
      children: null,
      content: '',
      markup: '',
      info: '',
      meta: null,
      block: true,
      hidden: false
    });

    return tokens;
  }
};

export const hrRule: BlockRule = {
  name: 'hr',
  test: /^---+$/,
  parse: (match, level) => [
    {
      type: 'hr',
      tag: 'hr',
      attrs: null,
      map: null,
      nesting: 0,
      level,
      children: null,
      content: '',
      markup: '---',
      info: '',
      meta: null,
      block: true,
      hidden: false
    }
  ]
};

export const blockRules: BlockRule[] = [
  listRule,
  blockquoteRule,
  codeBlockRule,
  tableRule,
  hrRule
];