export interface Token {
  type: string;
  tag?: string;
  attrs?: [string, string][];
  map?: [number, number];
  nesting: number;
  level: number;
  children?: Token[] | null;
  content: string;
  markup: string;
  info: string;
  meta: any;
  block: boolean;
  hidden: boolean;
}

export interface TableCell {
  content: string;
  align?: 'left' | 'center' | 'right';
}

export class MarkdownParser {
  private source: string = '';
  private tokens: Token[] = [];

  constructor() { }

  private parseInline(text: string): Token[] {
    const tokens: Token[] = [];
    let pos = 0;
    const len = text.length;

    while (pos < len) {
      // 解析删除线
      if (text.slice(pos).startsWith('~~')) {
        const endPos = text.indexOf('~~', pos + 2);
        if (endPos !== -1) {
          tokens.push({
            type: 'del_open',
            tag: 'del',
            attrs: null,
            map: null,
            nesting: 1,
            level: 0,
            children: null,
            content: '',
            markup: '~~',
            info: '',
            meta: null,
            block: false,
            hidden: false
          });

          tokens.push({
            type: 'text',
            tag: '',
            attrs: null,
            map: null,
            nesting: 0,
            level: 1,
            children: null,
            content: text.slice(pos + 2, endPos),
            markup: '',
            info: '',
            meta: null,
            block: false,
            hidden: false
          });

          tokens.push({
            type: 'del_close',
            tag: 'del',
            attrs: null,
            map: null,
            nesting: -1,
            level: 0,
            children: null,
            content: '',
            markup: '~~',
            info: '',
            meta: null,
            block: false,
            hidden: false
          });

          pos = endPos + 2;
          continue;
        }
      }
      // 解析加粗
      if (text.slice(pos).startsWith('**')) {
        const endPos = text.indexOf('**', pos + 2);
        if (endPos !== -1) {
          tokens.push({
            type: 'strong_open',
            tag: 'strong',
            attrs: null,
            map: null,
            nesting: 1,
            level: 0,
            children: null,
            content: '',
            markup: '**',
            info: '',
            meta: null,
            block: false,
            hidden: false
          });

          tokens.push({
            type: 'text',
            tag: '',
            attrs: null,
            map: null,
            nesting: 0,
            level: 1,
            children: null,
            content: text.slice(pos + 2, endPos),
            markup: '',
            info: '',
            meta: null,
            block: false,
            hidden: false
          });

          tokens.push({
            type: 'strong_close',
            tag: 'strong',
            attrs: null,
            map: null,
            nesting: -1,
            level: 0,
            children: null,
            content: '',
            markup: '**',
            info: '',
            meta: null,
            block: false,
            hidden: false
          });

          pos = endPos + 2;
          continue;
        }
      }

      // 解析斜体
      if (text.slice(pos).startsWith('*')) {
        const endPos = text.indexOf('*', pos + 1);
        if (endPos !== -1) {
          tokens.push({
            type: 'em_open',
            tag: 'em',
            attrs: null,
            map: null,
            nesting: 1,
            level: 0,
            children: null,
            content: '',
            markup: '*',
            info: '',
            meta: null,
            block: false,
            hidden: false
          });

          tokens.push({
            type: 'text',
            tag: '',
            attrs: null,
            map: null,
            nesting: 0,
            level: 1,
            children: null,
            content: text.slice(pos + 1, endPos),
            markup: '',
            info: '',
            meta: null,
            block: false,
            hidden: false
          });

          tokens.push({
            type: 'em_close',
            tag: 'em',
            attrs: null,
            map: null,
            nesting: -1,
            level: 0,
            children: null,
            content: '',
            markup: '*',
            info: '',
            meta: null,
            block: false,
            hidden: false
          });

          pos = endPos + 1;
          continue;
        }
      }

      // 普通文本
      let nextPos = text.slice(pos).search(/[\*~]/);
      if (nextPos === -1) nextPos = len - pos;
      else nextPos = nextPos;

      if (nextPos > 0) {
        tokens.push({
          type: 'text',
          tag: '',
          attrs: null,
          map: null,
          nesting: 0,
          level: 0,
          children: null,
          content: text.slice(pos, pos + nextPos),
          markup: '',
          info: '',
          meta: null,
          block: false,
          hidden: false
        });
        pos += nextPos;
      } else {
        pos++;
      }
    }

    return tokens;
  }

  parse(source: string): Token[] {
    this.source = source;
    this.tokens = [];
    const lines = source.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      // 解析表格
      if (line.startsWith('|') && line.endsWith('|')) {
        const rows: TableCell[][] = [];
        let alignments: ('left' | 'center' | 'right')[] = [];

        // 处理表头行
        const headerCells = line.split('|')
          .filter(cell => cell.trim())
          .map(cell => ({ content: cell.trim() }));
        rows.push(headerCells);

        // 处理对齐行
        if (i + 1 < lines.length) {
          const alignLine = lines[i + 1].trim();
          if (alignLine.startsWith('|') && alignLine.endsWith('|') && alignLine.includes('-')) {
            alignments = alignLine
              .split('|')
              .filter(cell => cell.trim())
              .map(cell => {
                const trimmed = cell.trim();
                if (trimmed.startsWith(':') && trimmed.endsWith(':')) return 'center';
                if (trimmed.endsWith(':')) return 'right';
                return 'left';
              });
            i++; // 跳过对齐行

            // 更新表头单元格的对齐方式
            rows[0] = rows[0].map((cell, index) => ({
              ...cell,
              align: alignments[index]
            }));

            // 处理数据行
            while (i + 1 < lines.length) {
              const dataLine = lines[i + 1].trim();
              if (!dataLine.startsWith('|') || !dataLine.endsWith('|')) break;

              const dataCells = dataLine
                .split('|')
                .filter(cell => cell.trim())
                .map((cell, index) => ({
                  content: cell.trim(),
                  align: alignments[index]
                }));
              rows.push(dataCells);
              i++;
            }

            // 添加表格标记
            this.tokens.push({
              type: 'table_open',
              tag: 'table',
              attrs: null,
              map: [i - rows.length + 1, i + 1],
              nesting: 1,
              level: 0,
              children: null,
              content: '',
              markup: '',
              info: '',
              meta: { rows },
              block: true,
              hidden: false
            });

            this.tokens.push({
              type: 'table_close',
              tag: 'table',
              attrs: null,
              map: null,
              nesting: -1,
              level: 0,
              children: null,
              content: '',
              markup: '',
              info: '',
              meta: null,
              block: true,
              hidden: false
            });
            continue;
          }
        }
      }

      // 解析标题
      if (line.startsWith('#')) {
        const level = line.match(/^#+/)[0].length;
        if (level <= 6) {
          this.tokens.push({
            type: 'heading_open',
            tag: `h${level}`,
            attrs: [
              ['class', 'line'],
              ['data-line', i.toString()]
            ],
            map: [i, i + 1],
            nesting: 1,
            level: 0,
            children: null,
            content: '',
            markup: '#'.repeat(level),
            info: '',
            meta: null,
            block: true,
            hidden: false
          });

          const inlineTokens = this.parseInline(line.slice(level).trim());
          const inlineToken: Token = {
            type: 'inline',
            tag: '',
            attrs: null,
            map: [i, i + 1],
            nesting: 0,
            level: 1,
            children: inlineTokens,
            content: line.slice(level).trim(),
            markup: '',
            info: '',
            meta: null,
            block: true,
            hidden: false
          };
          this.tokens.push(inlineToken);

          this.tokens.push({
            type: 'heading_close',
            tag: `h${level}`,
            attrs: null,
            map: null,
            nesting: -1,
            level: 0,
            children: null,
            content: '',
            markup: '#'.repeat(level),
            info: '',
            meta: null,
            block: true,
            hidden: false
          });
          continue;
        }
      }

      // 解析无序列表
      if (line.match(/^[*-] /)) {
        this.tokens.push({
          type: 'bullet_list_open',
          tag: 'ul',
          attrs: null,
          map: [i, i + 1],
          nesting: 1,
          level: 0,
          children: null,
          content: '',
          markup: '*',
          info: '',
          meta: null,
          block: true,
          hidden: false
        });

        this.tokens.push({
          type: 'list_item_open',
          tag: 'li',
          attrs: null,
          map: [i, i + 1],
          nesting: 1,
          level: 1,
          children: null,
          content: '',
          markup: '*',
          info: '',
          meta: null,
          block: true,
          hidden: false
        });

        const inlineTokens = this.parseInline(line.slice(2));
        const inlineToken: Token = {
          type: 'inline',
          tag: '',
          attrs: null,
          map: [i, i + 1],
          nesting: 0,
          level: 2,
          children: inlineTokens,
          content: line.slice(2),
          markup: '',
          info: '',
          meta: null,
          block: true,
          hidden: false
        };
        this.tokens.push(inlineToken);

        this.tokens.push({
          type: 'list_item_close',
          tag: 'li',
          attrs: null,
          map: null,
          nesting: -1,
          level: 1,
          children: null,
          content: '',
          markup: '*',
          info: '',
          meta: null,
          block: true,
          hidden: false
        });

        this.tokens.push({
          type: 'bullet_list_close',
          tag: 'ul',
          attrs: null,
          map: null,
          nesting: -1,
          level: 0,
          children: null,
          content: '',
          markup: '*',
          info: '',
          meta: null,
          block: true,
          hidden: false
        });
        continue;
      }

      // 解析有序列表
      if (line.match(/^\d+\.\s/)) {
        const listNumber = parseInt(line.match(/^\d+/)[0]);
        let currentNumber = listNumber;

        // 检查是否需要开启新的列表
        if (i === 0 || !lines[i - 1].match(/^\d+\.\s/)) {
          this.tokens.push({
            type: 'ordered_list_open',
            tag: 'ol',
            attrs: [['start', '1']],  // 始终从1开始
            map: [i, i + 1],
            nesting: 1,
            level: 0,
            children: null,
            content: '',
            markup: '1.',  // 使用固定的标记
            info: '',
            meta: null,
            block: true,
            hidden: false
          });
          currentNumber = 1;  // 重置为1
        } else {
          // 如果是列表中的后续项，序号加1
          currentNumber = parseInt(this.tokens[this.tokens.length - 3].markup) + 1;
        }

        this.tokens.push({
          type: 'list_item_open',
          tag: 'li',
          attrs: null,
          map: [i, i + 1],
          nesting: 1,
          level: 1,
          children: null,
          content: '',
          markup: currentNumber + '.',
          info: '',
          meta: null,
          block: true,
          hidden: false
        });

        const inlineTokens = this.parseInline(line.slice(line.indexOf(' ') + 1));
        const inlineToken: Token = {
          type: 'inline',
          tag: '',
          attrs: null,
          map: [i, i + 1],
          nesting: 0,
          level: 2,
          children: inlineTokens,
          content: line.slice(line.indexOf(' ') + 1),
          markup: '',
          info: '',
          meta: null,
          block: true,
          hidden: false
        };
        this.tokens.push(inlineToken);

        this.tokens.push({
          type: 'list_item_close',
          tag: 'li',
          attrs: null,
          map: null,
          nesting: -1,
          level: 1,
          children: null,
          content: '',
          markup: currentNumber + '.',
          info: '',
          meta: null,
          block: true,
          hidden: false
        });

        // 检查是否需要关闭列表
        if (i === lines.length - 1 || !lines[i + 1].match(/^\d+\.\s/)) {
          this.tokens.push({
            type: 'ordered_list_close',
            tag: 'ol',
            attrs: null,
            map: null,
            nesting: -1,
            level: 0,
            children: null,
            content: '',
            markup: '1.',
            info: '',
            meta: null,
            block: true,
            hidden: false
          });
        }
        continue;
      }

      // 解析代码块
      if (line.startsWith('```')) {
        const lang = line.slice(3);
        let codeContent = '';
        let j = i + 1;
        while (j < lines.length && !lines[j].startsWith('```')) {
          codeContent += lines[j] + '\n';
          j++;
        }

        this.tokens.push({
          type: 'fence',
          tag: 'code',
          attrs: [['class', `language-${lang}`]],
          map: [i, j],
          nesting: 0,
          level: 0,
          children: null,
          content: codeContent.trim(),
          markup: '```',
          info: lang,
          meta: null,
          block: true,
          hidden: false
        });

        i = j;
        continue;
      }

      // 解析引用
      if (line.startsWith('>')) {
        let quoteLevel = 0;
        let content = line;

        // 计算引用的嵌套层级
        while (content.startsWith('>')) {
          quoteLevel++;
          content = content.slice(1).trimStart();
        }

        // 为每一层级创建blockquote标签
        for (let level = 0; level < quoteLevel; level++) {
          this.tokens.push({
            type: 'blockquote_open',
            tag: 'blockquote',
            attrs: null,
            map: [i, i + 1],
            nesting: 1,
            level,
            children: null,
            content: '',
            markup: '>',
            info: '',
            meta: null,
            block: true,
            hidden: false
          });
        }

        const inlineTokens = this.parseInline(content);
        this.tokens.push({
          type: 'inline',
          tag: '',
          attrs: null,
          map: [i, i + 1],
          nesting: 0,
          level: quoteLevel,
          children: inlineTokens,
          content: content,
          markup: '',
          info: '',
          meta: null,
          block: true,
          hidden: false
        });

        // 关闭所有引用层级
        for (let level = quoteLevel - 1; level >= 0; level--) {
          this.tokens.push({
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
          });
        }
        continue;
      }

      // 解析水平线
      if (line.match(/^[-*_]{3,}$/)) {
        this.tokens.push({
          type: 'hr',
          tag: 'hr',
          attrs: null,
          map: [i, i + 1],
          nesting: 0,
          level: 0,
          children: null,
          content: '',
          markup: line[0],
          info: '',
          meta: null,
          block: true,
          hidden: false
        });
        continue;
      }

      // 解析表格
      if (line.startsWith('|') && line.endsWith('|')) {
        const rows = [];
        let j = i;

        // 解析表头
        const headerCells = line
          .split('|')
          .slice(1, -1)
          .map(cell => ({ content: cell.trim() }));
        rows.push(headerCells);

        // 解析对齐方式
        j++;
        if (j < lines.length) {
          const alignLine = lines[j].trim();
          if (alignLine.startsWith('|') && alignLine.endsWith('|')) {
            const aligns = alignLine
              .split('|')
              .slice(1, -1)
              .map(cell => {
                const trimmed = cell.trim();
                if (trimmed.startsWith(':') && trimmed.endsWith(':')) return 'center';
                if (trimmed.endsWith(':')) return 'right';
                return 'left';
              });

            // 解析数据行
            j++;
            while (j < lines.length) {
              const dataLine = lines[j].trim();
              if (!dataLine.startsWith('|') || !dataLine.endsWith('|')) break;

              const cells = dataLine
                .split('|')
                .slice(1, -1)
                .map((cell, index) => ({
                  content: cell.trim(),
                  align: aligns[index]
                }));
              rows.push(cells);
              j++;
            }

            // 生成表格tokens
            this.tokens.push({
              type: 'table_open',
              tag: 'table',
              attrs: [['class', 'md-table']],
              map: [i, j],
              nesting: 1,
              level: 0,
              children: null,
              content: '',
              markup: '',
              info: '',
              meta: { rows, aligns },
              block: true,
              hidden: false
            });

            this.tokens.push({
              type: 'table_close',
              tag: 'table',
              attrs: null,
              map: null,
              nesting: -1,
              level: 0,
              children: null,
              content: '',
              markup: '',
              info: '',
              meta: null,
              block: true,
              hidden: false
            });

            i = j - 1;
            continue;
          }
        }
      }

      // 处理普通段落
      this.tokens.push({
        type: 'paragraph_open',
        tag: 'p',
        attrs: null,
        map: [i, i + 1],
        nesting: 1,
        level: 0,
        children: null,
        content: '',
        markup: '',
        info: '',
        meta: null,
        block: true,
        hidden: false
      });

      const inlineTokens = this.parseInline(line);
      const inlineToken: Token = {
        type: 'inline',
        tag: '',
        attrs: null,
        map: [i, i + 1],
        nesting: 0,
        level: 1,
        children: inlineTokens,
        content: line,
        markup: '',
        info: '',
        meta: null,
        block: true,
        hidden: false
      };
      this.tokens.push(inlineToken);

      this.tokens.push({
        type: 'paragraph_close',
        tag: 'p',
        attrs: null,
        map: null,
        nesting: -1,
        level: 0,
        children: null,
        content: '',
        markup: '',
        info: '',
        meta: null,
        block: true,
        hidden: false
      });
    }

    return this.tokens;
  }

  render(tokens: Token[]): string {
    let html = '';
    for (const token of tokens) {
      switch (token.type) {
        case 'heading_open':
        case 'paragraph_open':
        case 'strong_open':
        case 'em_open':
        case 'bullet_list_open':
        case 'ordered_list_open':
        case 'list_item_open':
        case 'blockquote_open':
        case 'del_open':
          if (token.type === 'blockquote_open') {
            html += `<${token.tag} style="color: #666; border-left: 4px solid #ddd; padding-left: 1em;">`;
          } else if (token.type === 'ordered_list_open') {
            html += token.attrs ? `<${token.tag} ${token.attrs.map(([k, v]) => `${k}="${v}"`).join(' ')} style="list-style-position: inside; padding-left: 1.5em;">` : `<${token.tag} style="list-style-position: inside; padding-left: 1.5em;">`;
          } else {
            html += `<${token.tag}>`;
          }
          break;
        case 'heading_close':
        case 'paragraph_close':
        case 'strong_close':
        case 'em_close':
        case 'bullet_list_close':
        case 'ordered_list_close':
        case 'list_item_close':
        case 'blockquote_close':
        case 'del_close':
          html += `</${token.tag}>`;
          break;
        case 'fence':
          html += `<pre style="background-color: #f6f8fa; padding: 16px; border-radius: 6px; margin: 16px 0;"><code class="${token.attrs[0][1]}" style="font-family: 'Monaco', monospace;">${token.content}</code></pre>`;
          break;
        case 'hr':
          html += '<hr style="border: none; border-top: 1px solid #ddd; margin: 1em 0;">';
          break;
        case 'table_open':
          html += '<table style="border-collapse: collapse; width: 100%; margin: 16px 0;">';
          // 添加表头
          if (token.meta && token.meta.rows && token.meta.rows.length > 0) {
            html += '<thead><tr>';
            token.meta.rows[0].forEach((cell: TableCell) => {
              html += `<th style="border: 1px solid #ddd; padding: 8px; text-align: ${cell.align || 'left'};">${cell.content}</th>`;
            });
            html += '</tr></thead>';
            // 添加数据行
            if (token.meta.rows.length > 1) {
              html += '<tbody>';
              for (let i = 1; i < token.meta.rows.length; i++) {
                html += '<tr>';
                token.meta.rows[i].forEach((cell: TableCell) => {
                  html += `<td style="border: 1px solid #ddd; padding: 8px; text-align: ${cell.align || 'left'};">${cell.content}</td>`;
                });
                html += '</tr>';
              }
              html += '</tbody>';
            }
          }
          break;
        case 'table_close':
          html += '</table>';
          break;
        case 'inline':
          if (token.children) {
            html += this.render(token.children);
          } else {
            html += token.content;
          }
          break;
        case 'text':
          html += token.content;
          break;
      }
    }
    return html;
  }
}

export default MarkdownParser;