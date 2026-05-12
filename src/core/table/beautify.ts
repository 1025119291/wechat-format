export interface TableAnalysis {
  totalTables: number;
  wideTables: number;
  wideTableIndices: number[];
  warnings: string[];
}

/**
 * 扫描 HTML 中的表格，检测超宽表格
 */
export function analyzeTables(html: string): TableAnalysis {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const tables = doc.querySelectorAll('table');

  let wideTables = 0;
  const wideTableIndices: number[] = [];
  const warnings: string[] = [];

  tables.forEach((table, idx) => {
    const cols = getMaxColumns(table);
    if (cols > 5) {
      wideTables++;
      wideTableIndices.push(idx);
      warnings.push(`第 ${idx + 1} 个表格有 ${cols} 列，建议拆分或转为图片`);
    }
  });

  return { totalTables: tables.length, wideTables, wideTableIndices, warnings };
}

function getMaxColumns(table: Element): number {
  let max = 0;
  table.querySelectorAll('tr').forEach((tr) => {
    const cells = tr.querySelectorAll('td, th');
    let count = 0;
    cells.forEach((cell) => {
      count += parseInt(cell.getAttribute('colspan') || '1', 10);
    });
    if (count > max) max = count;
  });
  return max;
}

/**
 * 为超宽表格添加横向滚动包裹
 * 返回处理后的 HTML
 */
export function wrapWideTables(html: string): string {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const tables = doc.querySelectorAll('table');

  tables.forEach((table) => {
    const cols = getMaxColumns(table);
    if (cols > 5) {
      const wrapper = doc.createElement('section');
      wrapper.setAttribute('style', 'overflow-x: auto; -webkit-overflow-scrolling: touch; margin: 16px 0;');
      table.parentNode?.insertBefore(wrapper, table);
      wrapper.appendChild(table);

      const hint = doc.createElement('p');
      hint.setAttribute('style', 'font-size: 12px; color: #999; text-align: center; margin: 4px 0 0;');
      hint.textContent = '← 左右滑动查看完整表格 →';
      wrapper.appendChild(hint);
    }
  });

  return doc.body.innerHTML;
}
