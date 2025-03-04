import React, { useState, useCallback, useRef, useEffect } from 'react';
import styled from 'styled-components';
import MarkdownParser from './parser';
import { ThemeProvider, useTheme } from './theme/ThemeContext';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  background-color: ${({ theme }) => theme.colors.background};
`;

const EditorContainer = styled.div`
  display: flex;
  flex: 1;
  padding: 20px;
  margin-top: 40px;
`;

const Toolbar = styled.div<{ isSticky: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  display: flex;
  gap: 12px;
  padding: 8px 24px;
  background-color: ${({ theme }) => theme.colors.toolbarBg};
  border-radius: 0 0 12px 12px;
  box-shadow: ${({ theme }) => theme.colors.toolbarShadow};
  z-index: 1000;
  transition: all 0.3s ease;
  backdrop-filter: blur(8px);
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const ToolButton = styled.button`
  padding: 6px 8px;
  border: none;
  border-radius: 6px;
  background-color: ${({ theme }) => theme.colors.buttonBg};
  color: ${({ theme }) => theme.colors.text};
  cursor: pointer;
  font-size: 12px;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  min-width: 60px;
  position: relative;
  text-align: center;
  white-space: nowrap;

  > span {
    flex: 1;
    text-align: center;
    white-space: nowrap;
  }

  &:hover {
    background-color: ${({ theme }) => theme.colors.buttonHoverBg};
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  }

  &:active {
    background-color: ${({ theme }) => theme.colors.buttonActiveBg};
    transform: translateY(0);
  }

  &:disabled {
    background-color: ${({ theme }) => theme.colors.buttonDisabledBg};
    color: ${({ theme }) => theme.colors.buttonDisabledText};
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }

  &:before {
    content: '';
    display: inline-block;
    width: 14px;
    height: 14px;
    margin-right: 6px;
    background-size: contain;
    background-repeat: no-repeat;
    background-position: center;
    opacity: 0.7;
    flex-shrink: 0;
  }

  &:nth-child(1):before { content: '↩'; }
  &:nth-child(2):before { content: 'H1'; font-weight: bold; }
  &:nth-child(3):before { content: 'H2'; font-weight: bold; }
  &:nth-child(4):before { content: 'H3'; font-weight: bold; }
  &:nth-child(5):before { content: 'B'; font-weight: bold; }
  &:nth-child(6):before { content: 'I'; font-style: italic; }
  &:nth-child(7):before { content: '~'; text-decoration: line-through; }
  &:nth-child(8):before { content: '•'; }
  &:nth-child(9):before { content: '1.'; }
  &:nth-child(10):before { content: '"'; }
  &:nth-child(11):before { content: '</>'; font-family: monospace; }
  &:nth-child(12):before { content: '[+]'; }
  &:nth-child(13):before { content: '[↑]'; }
  &:nth-child(14):before { content: ${({ theme }) => theme.isDark ? '☀️' : '🌙'}; }
`;

const DropdownMenu = styled.div`
  position: absolute;
  top: calc(100% + 4px);
  right: 0;
  background-color: ${({ theme }) => theme.colors.dropdownBg};
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  min-width: 140px;
  width: max-content;
  opacity: 0;
  visibility: hidden;
  transform: translateY(-10px);
  transition: all 0.2s ease;
  z-index: 1001;

  ${ToolButton}:hover & {
    opacity: 1;
    visibility: visible;
    transform: translateY(0);
  }
`;

const DropdownItem = styled.div`
  padding: 10px 16px;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s;
  color: ${({ theme }) => theme.colors.text};
  font-size: 13px;

  &:hover {
    background-color: ${({ theme }) => theme.colors.dropdownHoverBg};
    color: ${({ theme }) => theme.colors.text};
  }

  &:first-child {
    border-radius: 8px 8px 0 0;
  }

  &:last-child {
    border-radius: 0 0 8px 8px;
  }

  &:not(:last-child) {
    border-bottom: 1px solid ${({ theme }) => theme.colors.dropdownBorder};
  }
`;

const EditorPane = styled.div`
  flex: 1;
  padding: 20px;
  background-color: ${({ theme }) => theme.colors.editorBg};
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-right: 10px;
`;

const PreviewPane = styled.div`
  flex: 1;
  padding: 20px;
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow-y: auto;
  color: ${({ theme }) => theme.colors.text};
`;

const TextArea = styled.textarea`
  width: 100%;
  height: 100%;
  border: none;
  resize: none;
  outline: none;
  font-family: 'Monaco', monospace;
  font-size: 14px;
  line-height: 1.6;
  background-color: ${({ theme }) => theme.colors.editorBg};
  color: ${({ theme }) => theme.colors.editorText};
`;

const App: React.FC = () => {
  const { toggleTheme, isDark } = useTheme();
  const [markdown, setMarkdown] = useState<string>('');
  const [history, setHistory] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(-1);
  const [isToolbarSticky, setIsToolbarSticky] = useState(false);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);
  const parser = new MarkdownParser();

  useEffect(() => {
    const handleScroll = () => {
      if (toolbarRef.current) {
        const toolbarPosition = toolbarRef.current.offsetTop;
        setIsToolbarSticky(window.scrollY > toolbarPosition);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setMarkdown(newText);
    setHistory(prev => [...prev.slice(0, currentIndex + 1), newText]);
    setCurrentIndex(prev => prev + 1);
  }, [currentIndex]);

  const handleUndo = useCallback(() => {
    if (currentIndex > 0) {
      const previousText = history[currentIndex - 1];
      setMarkdown(previousText);
      setCurrentIndex(prev => prev - 1);
    }
  }, [currentIndex, history]);

  const insertText = (before: string, after: string = '') => {
    const textarea = textAreaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = markdown.substring(start, end);

    // 处理有序列表的序号
    if (before === '1. ') {
      const lines = markdown.substring(0, start).split('\n');
      let lastNumber = 0;

      // 从光标位置向上查找最近的有序列表项
      for (let i = lines.length - 1; i >= 0; i--) {
        const match = lines[i].match(/^(\d+)\. /);
        if (match) {
          lastNumber = parseInt(match[1]);
          break;
        }
      }

      // 如果找到了前一个列表项，使用递增的序号
      if (lastNumber > 0) {
        before = `${lastNumber + 1}. `;
      }
    }

    const newText = markdown.substring(0, start) + before + selectedText + after + markdown.substring(end);
    setMarkdown(newText);
    setHistory(prev => [...prev.slice(0, currentIndex + 1), newText]);
    setCurrentIndex(prev => prev + 1);

    // 恢复光标位置
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, end + before.length);
    }, 0);
  };

  const toolbarActions = [
    { label: '撤销', action: handleUndo, disabled: currentIndex <= 0 },
    { label: '一级标题', action: () => insertText('# ', '\n') },
    { label: '二级标题', action: () => insertText('## ', '\n') },
    { label: '三级标题', action: () => insertText('### ', '\n') },
    { label: '粗体', action: () => insertText('**', '**') },
    { label: '斜体', action: () => insertText('*', '*') },
    { label: '删除线', action: () => insertText('~~', '~~') },
    { label: '无序列表', action: () => insertText('- ', '\n') },
    { label: '有序列表', action: () => insertText('1. ', '\n') },
    { label: '引用', action: () => insertText('> ', '\n') },
    { label: '代码段', action: () => insertText('```\n', '\n```') },
    { label: '表格', action: () => insertText('|标题1|标题2|标题3|\n|:---|:---:|---:|\n|左对齐|居中|右对齐|\n', '\n') },
    {
      label: '导出', action: () => { }, disabled: false, dropdown: [
        {
          label: '导出PDF',
          action: () => {
            const element = document.createElement('div');
            element.innerHTML = parsedHtml;
            element.style.cssText = `
              padding: 40px;
              background-color: white;
              font-family: Arial, sans-serif;
              line-height: 1.6;
              max-width: 210mm;
              margin: 0 auto;
            `;

            const style = document.createElement('style');
            style.textContent = `
              @media print {
                @page {
                  size: A4;
                  margin: 0;
                }
                body {
                  margin: 0;
                  -webkit-print-color-adjust: exact;
                  print-color-adjust: exact;
                }
              }
              pre { background-color: #f6f8fa !important; padding: 16px; border-radius: 6px; overflow-x: auto; }
              blockquote { color: #666; border-left: 4px solid #ddd; padding-left: 1em; margin: 1em 0; }
              table { border-collapse: collapse; width: 100%; margin: 16px 0; page-break-inside: avoid; }
              th, td { border: 1px solid #ddd; padding: 8px; }
              code { font-family: Monaco, monospace; background-color: #f6f8fa; padding: 2px 4px; border-radius: 3px; }
              h1, h2, h3, h4, h5, h6 { margin-top: 1.5em; margin-bottom: 0.5em; page-break-after: avoid; }
              p { margin: 1em 0; }
              ul, ol { padding-left: 2em; margin: 1em 0; }
              img { max-width: 100%; height: auto; page-break-inside: avoid; }
            `;
            element.appendChild(style);

            const container = document.createElement('div');
            container.style.position = 'fixed';
            container.style.left = '-9999px';
            container.appendChild(element);
            document.body.appendChild(container);

            window.print();
            document.body.removeChild(container);
          }
        },
        {
          label: '导出HTML',
          action: () => {
            const htmlContent = `
              <!DOCTYPE html>
              <html>
              <head>
                <meta charset="UTF-8">
                <title>Markdown Export</title>
                <style>
                  body { font-family: Arial, sans-serif; line-height: 1.6; padding: 40px; max-width: 800px; margin: 0 auto; }
                  pre { background-color: #f6f8fa; padding: 16px; border-radius: 6px; overflow-x: auto; }
                  blockquote { color: #666; border-left: 4px solid #ddd; padding-left: 1em; margin: 1em 0; }
                  table { border-collapse: collapse; width: 100%; margin: 16px 0; }
                  th, td { border: 1px solid #ddd; padding: 8px; }
                  code { font-family: Monaco, monospace; background-color: #f6f8fa; padding: 2px 4px; border-radius: 3px; }
                  h1, h2, h3, h4, h5, h6 { margin-top: 1.5em; margin-bottom: 0.5em; }
                  p { margin: 1em 0; }
                  ul, ol { padding-left: 2em; margin: 1em 0; }
                  img { max-width: 100%; height: auto; }
                </style>
              </head>
              <body>
                ${parsedHtml}
              </body>
              </html>
            `;
            const blob = new Blob([htmlContent], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'markdown-export.html';
            a.click();
            URL.revokeObjectURL(url);
          }
        }
      ]
    },
    { label: '主题', action: toggleTheme, disabled: false }
  ];

  const parsedHtml = parser.render(parser.parse(markdown));

  return (
    <Container>
      <Toolbar ref={toolbarRef} isSticky={isToolbarSticky}>
        {toolbarActions.map((action, index) => (
          <ToolButton
            key={index}
            onClick={action.action}
            disabled={action.disabled}
            style={{ opacity: action.disabled ? 0.5 : 1, position: action.dropdown ? 'relative' : 'static' }}
          >
            <span>{action.label}</span>
            {action.dropdown && (
              <DropdownMenu>
                {action.dropdown.map((item, dropdownIndex) => (
                  <DropdownItem key={dropdownIndex} onClick={item.action}>
                    {item.label}
                  </DropdownItem>
                ))}
              </DropdownMenu>
            )}
          </ToolButton>
        ))}
      </Toolbar>
      <EditorContainer>
        <EditorPane>
          <TextArea
            ref={textAreaRef}
            value={markdown}
            onChange={handleChange}
            placeholder="在这里输入Markdown文本..."
          />
        </EditorPane>
        <PreviewPane
          dangerouslySetInnerHTML={{ __html: parsedHtml }}
        />
      </EditorContainer>
    </Container>
  );
};

export default App;
