// 获取DOM元素
const inputText = document.getElementById('inputText');
const outputText = document.getElementById('outputText');
const convertBtn = document.getElementById('convertBtn');
const copyPlainBtn = document.getElementById('copyPlainBtn');
const copyHtmlBtn = document.getElementById('copyHtmlBtn');
const exportBtn = document.getElementById('exportBtn');

// 转换按钮点击事件
convertBtn.addEventListener('click', () => {
    const input = inputText.value;
    const { htmlOutput, plainOutput } = convertToTitleFormat(input);
    
    // 清空并重新设置输出区域的内容
    outputText.innerHTML = '';
    outputText.innerHTML = htmlOutput;
    
    // 存储转换后的内容
    outputText.setAttribute('data-plain-text', plainOutput);
    outputText.setAttribute('data-html-content', htmlOutput);
});

// 复制纯文本按钮点击事件
copyPlainBtn.addEventListener('click', () => {
    const plainText = outputText.getAttribute('data-plain-text');
    copyToClipboard(plainText, copyPlainBtn, '复制纯文本成功！');
});

// 复制富文本按钮点击事件
copyHtmlBtn.addEventListener('click', () => {
    const htmlContent = outputText.getAttribute('data-html-content');
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;
    document.body.appendChild(tempDiv);

    try {
        const range = document.createRange();
        range.selectNodeContents(tempDiv);
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
        
        document.execCommand('copy');
        const originalText = copyHtmlBtn.textContent;
        copyHtmlBtn.textContent = '复制富文本成功！';
        setTimeout(() => {
            copyHtmlBtn.textContent = originalText;
        }, 2000);
    } catch (err) {
        console.error('复制失败:', err);
    } finally {
        document.body.removeChild(tempDiv);
        window.getSelection().removeAllRanges();
    }
});

// 导出按钮点击事件
exportBtn.addEventListener('click', () => {
    try {
        // 获取当前的HTML内容
        const content = outputText.innerHTML;
        
        // 创建完整的Word文档HTML结构
        const wordDocument = `
            <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
            <head>
                <meta charset='utf-8'>
                <title>标题格式化文档</title>
                <style>
                    /* Word文档样式 */
                    body { font-family: 'Microsoft YaHei', SimSun, sans-serif; }
                    .preview-content { margin: 1em; }
                    h1 { font-size: 18pt; font-weight: bold; margin-top: 12pt; margin-bottom: 6pt; }
                    h2 { font-size: 16pt; font-weight: bold; margin-top: 10pt; margin-bottom: 6pt; }
                    h3 { font-size: 14pt; font-weight: bold; margin-top: 8pt; margin-bottom: 6pt; }
                    h4 { font-size: 12pt; font-weight: bold; margin-top: 8pt; margin-bottom: 6pt; }
                    p { font-size: 12pt; margin-top: 6pt; margin-bottom: 6pt; }
                    
                    /* 缩进样式 */
                    h1 { margin-left: 0pt; }
                    h2 { margin-left: 12pt; }
                    h3 { margin-left: 24pt; }
                    h4 { margin-left: 36pt; }
                </style>
            </head>
            <body>
                ${content}
            </body>
            </html>
        `;
        
        // 创建Blob对象
        const blob = new Blob([wordDocument], {
            type: 'application/msword;charset=utf-8'
        });
        
        // 创建下载链接
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = '标题格式化文档.doc'; // 使用.doc扩展名
        
        // 模拟点击下载
        document.body.appendChild(link);
        link.click();
        
        // 清理
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
        
        // 显示成功提示
        const originalText = exportBtn.textContent;
        exportBtn.textContent = '导出成功！';
        setTimeout(() => {
            exportBtn.textContent = originalText;
        }, 2000);
        
    } catch (err) {
        console.error('导出失败:', err);
        alert('导出失败，具体原因：' + err.message);
    }
});

// 复制到剪贴板的通用函数
function copyToClipboard(text, button, successMessage) {
    const tempTextArea = document.createElement('textarea');
    tempTextArea.value = text;
    document.body.appendChild(tempTextArea);
    tempTextArea.select();
    
    try {
        document.execCommand('copy');
        const originalText = button.textContent;
        button.textContent = successMessage || '复制成功！';
        setTimeout(() => {
            button.textContent = originalText;
        }, 2000);
    } catch (err) {
        console.error('复制失败:', err);
    } finally {
        document.body.removeChild(tempTextArea);
    }
}

// 复制HTML内容到剪贴板
function copyHtmlToClipboard(html, button) {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    tempDiv.style.position = 'fixed';
    tempDiv.style.pointerEvents = 'none';
    tempDiv.style.opacity = '0';
    document.body.appendChild(tempDiv);

    try {
        const range = document.createRange();
        range.selectNodeContents(tempDiv);
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
        
        document.execCommand('copy');
        const originalText = button.textContent;
        button.textContent = '复制富文本成功！';
        setTimeout(() => {
            button.textContent = originalText;
        }, 2000);
    } catch (err) {
        console.error('复制失败:', err);
    } finally {
        document.body.removeChild(tempDiv);
        window.getSelection().removeAllRanges();
    }
}

// 检测编号格式并返回级别
function detectNumberingLevel(line, context) {
    // 基本格式检查
    if (!line || line.trim().length === 0) {
        return { match: false };
    }

    // 智能特征检查
    const features = analyzeLineFeatures(line);
    
    // 放宽标题判断条件
    if (!features.couldBeTitle && !features.hasKeywords && !features.isQuestion) {
        return { match: false };
    }

    // 匹配多种编号格式
    const patterns = [
        // 6. 7. 8. 格式（新增）
        /^\d+\.\s*/,
        // 1、2、格式
        /^\d+、\s*/,
        // 1.1、2.1、格式
        /^(\d+\.)+\d+、\s*/,
        // 1.1.1. 或 1.1.1 格式
        /^(\d+\.)+\d*\.?\s*/,
        // (1)(1.1) 格式
        /^\((\d+\.)*\d+\)\s*/,
        // 一、二、 格式
        /^[一二三四五六七八九十]+、\s*/,
        // (一)(二) 格式
        /^\([一二三四五六七八九十]+\)\s*/,
        // 1）2）格式
        /^(\d+）)+\d*）?\s*/,
        // ① ② 格式
        /^[①②③④⑤⑥⑦⑧⑨⑩]\s*/
    ];

    for (let pattern of patterns) {
        const match = line.match(pattern);
        if (match) {
            const numberText = match[0];
            
            // 获取编号信息
            const numberInfo = analyzeNumbering(numberText, pattern);
            
            // 检查上下文连续性（使用容错机制）
            if (context && !isNumberingContinuous(numberInfo, context, features)) {
                continue; // 尝试下一个模式
            }

            return {
                match: true,
                number: numberText,
                level: numberInfo.level,
                value: numberInfo.value
            };
        }
    }

    return { match: false };
}

// 分析行的特征
function analyzeLineFeatures(line) {
    const trimmedLine = line.trim();
    return {
        couldBeTitle: (
            // 放宽长度限制（有些问答式标题会较长）
            trimmedLine.length <= 100 &&
            // 允许更多的标点符号
            (trimmedLine.match(/[，。；？！，、：]/g) || []).length <= 5 &&
            // 允许问号结尾（问答式标题）
            (!trimmedLine.endsWith('。') || trimmedLine.endsWith('？') || trimmedLine.endsWith('?')) &&
            // 允许引号（可能是引用或强调）
            // !trimmedLine.includes('"') &&
            // !trimmedLine.includes('"') &&
            // 放宽语气词限制，但保留一些明显的口语词
            !trimmedLine.match(/([啊哦呢嘛]$)/) &&
            // 不是缩进的段落
            !line.match(/^\s{2,}/) &&
            // 新增：检查是否以数字开头（考虑各种格式）
            (/^\d+[.、）\s]/.test(trimmedLine) || 
             /^[一二三四五六七八九十][.、）\s]/.test(trimmedLine) ||
             /^[①②③④⑤⑥⑦⑧⑨⑩]/.test(trimmedLine))
        ),
        // 其他特征
        hasColon: trimmedLine.includes('：'), // 标题可能包含冒号
        length: trimmedLine.length,
        startsWithNumber: /^\d/.test(trimmedLine),
        // 新增：是否是问答式标题
        isQuestion: trimmedLine.includes('？') || trimmedLine.includes('?'),
        // 新增：包含关键词
        hasKeywords: /选择|如何|怎么|为什么|区别|方法|步骤/.test(trimmedLine)
    };
}

// 分析编号信息
function analyzeNumbering(numberText, pattern) {
    let level = 1;
    let value = 0;

    if (pattern.source.includes('①')) {
        value = '①②③④⑤⑥⑦⑧⑨⑩'.indexOf(numberText.trim()[0]) + 1;
    } else if (pattern.source.includes('[一二三]')) {
        const numMap = {'一':1,'二':2,'三':3,'四':4,'五':5,'六':6,'七':7,'八':8,'九':9,'十':10};
        value = numMap[numberText.replace(/[、\(\)）]/g, '').trim()] || 0;
    } else {
        // 提取数字部分
        const numbers = numberText.match(/\d+/g) || [];
        if (numbers.length > 0) {
            value = parseInt(numbers[numbers.length - 1]);
            // 根据格式判断级别
            if (numberText.includes('、')) {
                // 对于 x、格式，根据点号的数量判断级别
                level = (numberText.match(/\./g) || []).length + 1;
            } else {
                level = (numberText.match(/[.、）]/g) || []).length || 1;
            }
        }
    }

    return { level, value };
}

// 检查编号的连续性（带容错机制）
function isNumberingContinuous(currentInfo, context, features) {
    const { previousNumbers = [], previousLevels = [], previousValues = [] } = context;
    
    // 如果是第一个编号，直接通过
    if (previousNumbers.length === 0) return true;

    // 获取上一个相同级别的信息
    let lastSameLevelIndex = previousLevels.lastIndexOf(currentInfo.level);
    
    if (lastSameLevelIndex === -1) {
        // 新的级别，检查是否合理
        const lastLevel = previousLevels[previousLevels.length - 1];
        return currentInfo.level === lastLevel + 1 || currentInfo.level < lastLevel;
    }

    // 获取上一个相同级别的值
    const prevValue = previousValues[lastSameLevelIndex];
    
    // 容错机制：
    // 1. 允许最多跳过2个数字
    // 2. 如果行的特征很像标题，允许更大的容错
    const maxGap = features.couldBeTitle ? 3 : 2;
    const isWithinGap = currentInfo.value - prevValue <= maxGap;
    
    // 如果数字不连续但间隔在允许范围内，且行特征像标题，则通过
    if (!isWithinGap && features.couldBeTitle) {
        // 检查其他标题特征
        return (
            features.length < 30 || // 较短的行
            features.hasColon || // 包含冒号
            currentInfo.level === 1 // 一级标题允许更大的跳跃
        );
    }

    return isWithinGap;
}

// 创建Word文档内容
function createWordDocument(text) {
    if (!text.trim()) return [];
    
    const lines = text.split('\n');
    const docContent = [];
    const context = {
        previousNumbers: [],
        previousLevels: []
    };
    
    lines.forEach(line => {
        line = line.trim();
        if (!line) return;
        
        const result = detectNumberingLevel(line, context);
        
        if (result.match) {
            const title = line.substring(result.number.length).trim();
            
            // 更新上下文
            context.previousNumbers.push(result.number);
            context.previousLevels.push(result.level);
            
            // 创建标题段落，包含编号
            docContent.push(new docx.Paragraph({
                text: result.number + title,
                heading: docx.HeadingLevel[`HEADING_${result.level}`],
                spacing: {
                    before: 240,
                    after: 120
                }
            }));
        } else {
            // 创建普通段落
            docContent.push(new docx.Paragraph({
                text: line,
                spacing: {
                    before: 120,
                    after: 120
                }
            }));
        }
    });
    
    return docContent;
}

// 转换函数
function convertToTitleFormat(text) {
    if (!text.trim()) return { htmlOutput: '', plainOutput: '' };
    
    const lines = text.split('\n');
    let htmlOutput = '<div class="preview-content">'; // 添加容器
    let plainOutput = '';
    
    const context = {
        previousNumbers: [],
        previousLevels: [],
        previousValues: []
    };
    
    // 处理每一行
    lines.forEach(line => {
        line = line.trim();
        if (!line) return;
        
        const result = detectNumberingLevel(line, context);
        
        if (result.match) {
            const title = line.substring(result.number.length).trim();
            
            // 更新上下文
            context.previousNumbers.push(result.number);
            context.previousLevels.push(result.level);
            context.previousValues.push(result.value);
            
            // 生成输出，添加更明显的视觉样式
            const indentSize = (result.level - 1) * 20;
            const fontSize = 1.8 - (result.level - 1) * 0.2;
            const headingStyle = `
                margin: 0.5em 0;
                padding-left: ${indentSize}px;
                font-size: ${fontSize}em;
                font-weight: bold;
                color: #1d1d1f;
                background-color: ${result.level === 1 ? '#f8f8f8' : 'transparent'};
                border-radius: 4px;
                padding: 8px;
                padding-left: ${indentSize + 8}px;
            `;
            
            htmlOutput += `<h${result.level} style="${headingStyle}">${result.number}${title}</h${result.level}>\n`;
            plainOutput += result.number + title + '\n';
        } else {
            // 为普通段落添加更好的样式
            const paragraphStyle = `
                margin: 0.5em 0;
                color: #666;
                padding: 4px 8px;
            `;
            htmlOutput += `<p style="${paragraphStyle}">${line}</p>\n`;
            plainOutput += line + '\n';
        }
    });
    
    htmlOutput += '</div>'; // 关闭容器
    
    return { htmlOutput, plainOutput };
}

// 添加输入示例
inputText.placeholder = `示例文本格式：
1. 第一章 引言
1.1 研究背景
1.2 研究意义
2、第二章 文献综述
2.1、国内研究现状
2.2、国外研究进展
(一)主要发现
(二)研究方法
①重要性分析
②可行性分析`;

// 自动调整文本框高度
inputText.addEventListener('input', function() {
    this.style.height = 'auto';
    this.style.height = (this.scrollHeight) + 'px';
});

// 添加快捷键支持
inputText.addEventListener('keydown', function(e) {
    // 检测 Ctrl + Enter
    if (e.ctrlKey && e.key === 'Enter') {
        e.preventDefault(); // 阻止默认行为
        convertBtn.click(); // 触发转换按钮点击
    }
}); 