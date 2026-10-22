/**
 * @file 整句文字的排版估算
 * @desc 汇聚吸入要把一句完整答案排进画面。工厂构造时没有画布，`measureText` 用不了，
 *   所以这里用「字宽单位」估算：中日韩字符 1 个字宽，其余 0.56 个。
 *   误差只影响留白，不影响可读性 —— 真正的形状由 `glyph-field` 采样决定。
 */

/** 拆行时优先在这些字符后面断开 */
const BREAK_CHARS = /[\s,，.。、;；:：!！?？/|]/;

function charUnits(char: string): number {
  return /[一-鿿]/.test(char) ? 1 : 0.56;
}

/** 一行文字占多少个「字宽」 */
export function estimateTextUnits(text: string): number {
  let units = 0;

  for (const char of Array.from(text)) {
    units += charUnits(char);
  }

  return units;
}

/** 一行文字的像素宽度估算，至少一个字宽 */
export function estimateTextWidth(text: string, fontSize: number): number {
  return Math.max(fontSize, estimateTextUnits(text) * fontSize);
}

/**
 * 把一句长答案拆成最多 `maxLines` 行
 *
 * @param maxUnits 每行最多多少个字宽
 *
 * @desc 拆行不是装饰：一行塞不下时，硬缩字号会让字小到读不清。优先在空格与
 *   标点后断开，找不到再按字宽硬拆。最后一行无论多长都收下 —— 调用方会按
 *   实际最长的一行重新算字号，所以不会溢出
 */
export function splitIntoLines(text: string, maxUnits: number, maxLines: number): string[] {
  const chars = Array.from(text.trim());

  if (chars.length === 0) {
    return [];
  }

  const whole = chars.join('');
  if (maxLines <= 1 || estimateTextUnits(whole) <= maxUnits) {
    return [whole];
  }

  const lines: string[] = [];
  let cursor = 0;

  while (cursor < chars.length && lines.length < maxLines) {
    if (lines.length === maxLines - 1) {
      lines.push(chars.slice(cursor).join('').trim());
      break;
    }

    let end = cursor;
    let units = 0;

    while (end < chars.length && units + charUnits(chars[end]) <= maxUnits) {
      units += charUnits(chars[end]);
      end += 1;
    }

    // maxUnits 至少为 1，正常走不到这里；防一手 while 空转
    if (end <= cursor) {
      end = cursor + 1;
    }

    // 从行尾往回找断点，只在后半行找 —— 太靠前会把第一行拆得过短
    const minBreak = cursor + Math.max(1, Math.floor((end - cursor) * 0.55));
    for (let index = end; index > minBreak; index -= 1) {
      if (BREAK_CHARS.test(chars[index - 1])) {
        end = index;
        break;
      }
    }

    lines.push(chars.slice(cursor, end).join('').trim());
    cursor = end;
  }

  return lines.filter(Boolean);
}
