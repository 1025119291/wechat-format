import { useEffect, useMemo, useState } from 'react';
import { useAppStore, type FontSize } from './store';
import { themeList } from './core/themes';
import { markdownToWechatHtml, htmlToWechatHtml } from './core/parser/markdown';
import { normalizePastedHtml, analyzePastedHtml } from './core/parser/larkHtml';
import { copyHtmlToClipboard, downloadHtml } from './core/exporter/clipboard';
import { warmupHighlighter } from './core/code/highlight';
import { wrapWideTables } from './core/table/beautify';

const FONT_SIZE_MAP: Record<FontSize, number> = { small: 14, standard: 15, large: 16 };

export default function App() {
  const {
    inputMode,
    markdown,
    pastedHtml,
    themeId,
    renderedHtml,
    previewDevice,
    fontSize,
    lineHeight,
    paragraphSpacing,
    firstLineIndent,
    setInputMode,
    setMarkdown,
    setPastedHtml,
    setThemeId,
    setRenderedHtml,
    setPreviewDevice,
    setFontSize,
    setLineHeight,
    setParagraphSpacing,
    setFirstLineIndent,
    getTheme,
  } = useAppStore();

  const [toast, setToast] = useState<string>('');
  const [showTuning, setShowTuning] = useState(false);

  useEffect(() => {
    warmupHighlighter();
  }, []);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      const theme = getTheme();
      try {
        let html: string;
        if (inputMode === 'markdown') {
          html = await markdownToWechatHtml(markdown || '', theme);
        } else {
          const clean = pastedHtml ? normalizePastedHtml(pastedHtml) : '';
          html = clean ? await htmlToWechatHtml(clean, theme) : '';
        }

        // 应用微调参数：字号、行高、段距、首行缩进
        const px = FONT_SIZE_MAP[fontSize];
        html = html.replace(
          /(<section data-role="article"[^>]*style=")([^"]*)(")/,
          (_, prefix: string, style: string, suffix: string) => {
            let s = style;
            s = s.replace(/font-size:\s*\d+px/, `font-size: ${px}px`);
            s = s.replace(/line-height:\s*[\d.]+/, `line-height: ${lineHeight}`);
            return prefix + s + suffix;
          },
        );
        html = html.replace(
          /(<p[^>]*style=")([^"]*)(")/g,
          (_, prefix: string, style: string, suffix: string) => {
            let s = style;
            s = s.replace(/margin:\s*0 0 \d+px/, `margin: 0 0 ${paragraphSpacing}px`);
            s = s.replace(/line-height:\s*[\d.]+/, `line-height: ${lineHeight}`);
            if (firstLineIndent && !s.includes('text-indent')) {
              s += '; text-indent: 2em';
            }
            return prefix + s + suffix;
          },
        );

        // 超宽表格包裹
        html = wrapWideTables(html);

        if (!cancelled) setRenderedHtml(html);
      } catch (e) {
        console.error(e);
        if (!cancelled) setRenderedHtml('<p style="color:red">渲染出错，请检查输入。</p>');
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [inputMode, markdown, pastedHtml, themeId, fontSize, lineHeight, paragraphSpacing, firstLineIndent]);

  const previewSrcDoc = useMemo(() => {
    return `<!doctype html><html><head><meta charset="utf-8"><style>body{margin:0;padding:20px;background:#fff;}</style></head><body>${renderedHtml}</body></html>`;
  }, [renderedHtml]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  };

  const handleCopy = async () => {
    if (!renderedHtml) {
      showToast('还没有内容可复制');
      return;
    }
    const result = await copyHtmlToClipboard(renderedHtml);
    if (result.success) {
      const msgs = ['已复制，请到公众号编辑器 Ctrl+V 粘贴'];
      if (result.report.warnings.length > 0) msgs.push(...result.report.warnings);
      if (result.imageSummary.warnings.length > 0) msgs.push(...result.imageSummary.warnings);
      if (result.tableWarnings.length > 0) msgs.push(...result.tableWarnings);
      showToast(msgs.join('；'));
    } else {
      showToast('复制失败，请手动选择复制');
    }
  };

  const handleDownload = () => {
    if (!renderedHtml) return;
    downloadHtml(renderedHtml);
    showToast('已下载 HTML 文件');
  };

  const handlePaste: React.ClipboardEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault();
    const html = e.clipboardData.getData('text/html');
    const text = e.clipboardData.getData('text/plain');
    if (html) {
      const analysis = analyzePastedHtml(html);
      setPastedHtml(html);
      if (analysis.isLark) {
        const imgWarn = analysis.imageStats
          .filter((i) => i.type === 'base64' || i.type === 'lark-private')
          .length;
        const msg = `检测到飞书内容，已自动清理 ${analysis.cleanedCount} 个冗余属性`;
        showToast(imgWarn > 0 ? `${msg}；${imgWarn} 张图片需手动处理` : msg);
      } else {
        showToast('已识别富文本粘贴内容');
      }
    } else if (text) {
      const escaped = text
        .split(/\n{2,}/)
        .map((p) => `<p>${p.replace(/\n/g, '<br/>')}</p>`)
        .join('');
      setPastedHtml(escaped);
      showToast('已识别纯文本，已自动分段');
    }
  };

  return (
    <div className="app">
      <div className="app-header">
        <h1>微信公众号排版工具</h1>
        <div className="toolbar">
          <div className="template-picker">
            {themeList.map((t) => (
              <button
                key={t.id}
                className={`template-card ${themeId === t.id ? 'active' : ''}`}
                onClick={() => setThemeId(t.id)}
                title={t.description}
              >
                {t.name}
              </button>
            ))}
          </div>
          <button className="btn" onClick={() => setShowTuning(!showTuning)}>
            {showTuning ? '收起微调' : '微调'}
          </button>
          <button className="btn" onClick={handleDownload}>
            下载 HTML
          </button>
          <button className="btn btn-primary" onClick={handleCopy}>
            复制到公众号
          </button>
        </div>
      </div>

      {showTuning && (
        <div className="tuning-bar">
          <label>
            字号
            <select value={fontSize} onChange={(e) => setFontSize(e.target.value as FontSize)}>
              <option value="small">小 (14px)</option>
              <option value="standard">标准 (15px)</option>
              <option value="large">大 (16px)</option>
            </select>
          </label>
          <label>
            行高
            <input
              type="range" min="1.5" max="2.2" step="0.1"
              value={lineHeight}
              onChange={(e) => setLineHeight(parseFloat(e.target.value))}
            />
            <span>{lineHeight.toFixed(1)}</span>
          </label>
          <label>
            段距
            <input
              type="range" min="8" max="24" step="2"
              value={paragraphSpacing}
              onChange={(e) => setParagraphSpacing(parseInt(e.target.value, 10))}
            />
            <span>{paragraphSpacing}px</span>
          </label>
          <label>
            首行缩进
            <input
              type="checkbox"
              checked={firstLineIndent}
              onChange={(e) => setFirstLineIndent(e.target.checked)}
            />
          </label>
        </div>
      )}

      <div className="app-body">
        <div className="pane">
          <div className="pane-header">
            <span
              className={`tab ${inputMode === 'markdown' ? 'active' : ''}`}
              onClick={() => setInputMode('markdown')}
            >
              Markdown
            </span>
            <span
              className={`tab ${inputMode === 'paste' ? 'active' : ''}`}
              onClick={() => setInputMode('paste')}
            >
              粘贴飞书/富文本
            </span>
          </div>
          <div className="pane-body no-pad">
            {inputMode === 'markdown' ? (
              <textarea
                className="editor"
                value={markdown}
                onChange={(e) => setMarkdown(e.target.value)}
                spellCheck={false}
              />
            ) : (
              <div
                className="paste-zone"
                contentEditable
                suppressContentEditableWarning
                onPaste={handlePaste}
              >
                {pastedHtml ? (
                  <div dangerouslySetInnerHTML={{ __html: pastedHtml }} />
                ) : (
                  '在此处粘贴（Ctrl/⌘ + V）飞书、Word、网页等富文本内容'
                )}
              </div>
            )}
          </div>
        </div>

        <div className="pane">
          <div className="pane-header">
            <span style={{ fontWeight: 600, color: '#333' }}>预览</span>
            <div className="device-toggle">
              <button
                className={`device-btn ${previewDevice === 'mobile' ? 'active' : ''}`}
                onClick={() => setPreviewDevice('mobile')}
                title="手机端效果 (375px)"
              >
                📱 手机
              </button>
              <button
                className={`device-btn ${previewDevice === 'pc' ? 'active' : ''}`}
                onClick={() => setPreviewDevice('pc')}
                title="公众号 PC 端 (677px)"
              >
                💻 PC
              </button>
            </div>
            <span style={{ marginLeft: 'auto', color: '#999' }}>
              模板：{getTheme().name}
            </span>
          </div>
          <div className="pane-body preview-stage">
            <div className={`device-frame device-${previewDevice}`}>
              <iframe
                className="preview-frame"
                srcDoc={previewSrcDoc}
                sandbox="allow-same-origin"
                title="preview"
              />
            </div>
          </div>
        </div>
      </div>

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
