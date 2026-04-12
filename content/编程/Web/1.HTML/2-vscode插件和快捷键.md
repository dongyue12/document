# 2-vscode插件和快捷键
vsocde设置和插件
-----------

### 设置推荐

点击左下角的齿轮按钮，在点击设置按钮，进入设置按钮后，右上角会有一个文件图标，点击会显示打开 settings.json设置文件

设置推荐

```application-javascript-env-backend
  // 文件自动保存策略：延迟一段时间后自动保存（默认延迟1000ms）
  "files.autoSave": "afterDelay",
  // 自动猜测文件的字符编码，避免打开文件时出现乱码
  "files.autoGuessEncoding": true,
  // 工作台列表（如文件列表、搜索结果）启用平滑滚动效果
  "workbench.list.smoothScrolling": true,
  // 编辑器光标移动时启用平滑的插入符动画，视觉更流畅
  "editor.cursorSmoothCaretAnimation": "on",
  // 编辑器内容滚动时启用平滑滚动效果
  "editor.smoothScrolling": true,
  // 光标闪烁方式设置为平滑闪烁（而非固定频率的闪烁）
  "editor.cursorBlinking": "smooth",
  // 允许通过鼠标滚轮配合Ctrl键（或Cmd键）缩放编辑器字体大小
  "editor.mouseWheelZoom": true,
  // 粘贴内容时自动格式化，保持代码风格统一
  "editor.formatOnPaste": true,
  // 输入代码时（如打完分号/括号）自动格式化当前行/块
  "editor.formatOnType": true,
  // 保存文件时自动格式化整个文件，强制代码风格规范
  "editor.formatOnSave": true,
  // 启用编辑器文字自动换行，无需横向滚动查看长行代码
  "editor.wordWrap": "on",
  // 显示括号对的引导线，方便识别括号嵌套层级
  "editor.guides.bracketPairs": true,
  // 注：新版VSCode已默认开启括号对彩色高亮，无需手动配置
  // "editor.bracketPairColorization.enabled": true,
  // 代码片段提示不会阻止快速建议的显示，确保补全提示不被遮挡
  "editor.suggest.snippetsPreventQuickSuggestions": false,
  // 按Enter键接受代码建议时采用智能策略：仅在明确选中建议时生效
  "editor.acceptSuggestionOnEnter": "smart",
  // 代码建议列表优先显示最近使用过的选项，提升补全效率
  "editor.suggestSelection": "recentlyUsed",
  // 将VSCode的对话框样式设置为自定义样式（而非系统原生样式）
  "window.dialogStyle": "custom",
  // 在编辑器右侧的概览标尺中显示断点位置，方便快速定位断点
  "debug.showBreakpointsInOverviewRuler": true
```

### 插件推荐

*   Dracula Official  一款很有特点的吸血鬼主题
*   Material Icon Theme  好看，类型大而全
*   vscode-icons  也是一款不错的图标主题  
    Chinese (Simplified) (简体中文)  ：【中文语言包】这应该不用多介绍，是vscode的官方中文语言包
*   Error Lens 【错误提示】可以将原先显示的问题显示在对应行右侧并高亮
*   Path Intellisense  【路径补全】在输入路径时，有智能提示补全
*   Image preview  【图像预览】可以预览引入的图像
*   CodeSnap 【代码截图】一款非常好用的代码截图插件
*   Prettier - Code formatter  【代码格式化工具】支持超多语言，一键格式化，美化代码格式
*   GBK to UTF8 for vscode  【文件编码转化】可以将文件在GBK与UTF8编码之间无瑕转换
*   Hex Editor  用来查看文件的hex或UTF-8编码
*   Doxygen Documentation Generator  【文档生成器】写注释和文档时非常好用
*   Remote - SSH  【ssh连接】连接远程服务器或虚拟机
*   Hungry Delete  【像IDEA的退格键】删除整个空格或制表符块，并减少程序员按退格键所需的时间
*   CodeGeeX【AI代码补全】可以自动补全代码 ，并且完全免费
*   Live Preview 【可以自动跟新网页页面】右键点击显示预览就会在右侧打开预览，如果想在浏览器打开，可以点击右上角横杠，选择在浏览器打开
*   Auto Rename Tag 【修改html开始标签时，结束标签也会修改】
*   Easy LESS 【保存时自动转换为css】
*   会了吧 \*\*【\*\*代码翻译工具】打开源码文件可以自动分析所有包含的英语单词，并显示解释结果，先学单词再看代码。

### 快捷键

*   Ctrl + P 快速打开最近打开的文件
*   Ctrl + F 查找
*   Ctrl + H 替换
*   Ctrl + Shift + F 全局查找
*   Ctrl + Shift + H 全局替换
*   Ctrl + Shift + V 粘贴并格式化
*   Ctrl + C 复制
*   Ctrl + Z 撤销
*   Ctrl + Shift + P 打开命令面板
*   ctrl + , 打开设置
*   ctrl + \[ 向左缩进
*   ctrl + \] 向右缩进
*   ctrl + / 单行注释
*   ctrl + shift + / 多行注释
*   shift + alt + f 格式化代码

### pink老师快捷键

vscode 常用的插件地址： [https://www.bilibili.com/read/cv9698270](https://www.bilibili.com/read/cv9698270)

本篇文章，主要介绍vscode常用的快捷键，可以提高我们的开发效率。

一、VSCode常用的快捷键

注意，其实这个快捷键都是可以自定义的，为了防止自定义快捷键和默认冲突我，我们先熟悉默认的，后期熟悉可以自定义更改。

最常用的单词，咱们这里就不重复了。

1. 快速复制一行  

快捷键： shift+alt+ 下箭头(上箭头)         或者 ctrl+c  然后 ctrl+v

2. 选定多个相同的单词 

快捷键：  ctrl + d  

先双击选定一个单词，然后按下 ctrl + d  可以往下依次选择相同的单词。 这样同时修改相同的单词就非常方便

3. 添加多个光标

快捷键：  Ctrl + Alt +  上箭头(下箭头)  

4. 全局替换某写单词

当我们一个页面需要修改大量相同的文字的时候，我们一个的修改超级麻烦，此时我们可以使用全局替换

快捷键：  ctrl + h        注意选择全部替换即可

5. 快速定位到某一行

当我们页面比较长的时候，上下滚动页面布方便，其实我们可以利用快捷键，快速的调到指定的行数上。

快捷键：  ctrl + g  

6. 选择某个区块

可以选择一个区块进行操作

快捷键：  按住shift + alt  然后拖动鼠标

7. 放大缩小整个编辑器界面

快捷键：  ctrl +   +  /  -    ctrl +  加号或者减号

8. 自定义快捷键

有些快捷键，我们使用不习惯，其实我们可以自定义快捷键的。

比如js 的多行注释是 shift + alt  + a  ，我们想修改为 ctrl + shfit +  /   

设置方法：

*   按下 Ctrl + K 然后再按 Ctrl + S（适用于 Windows 和 Linux）。
*   对于 macOS 用户，可以使用 ⌘ + K 然后 ⌘ + S。 
*   输入  切换块注释 找到这个快捷键  ----- 点击左侧的编辑按钮  ---- 直接按下  ctrl + shift  +  /     ---- 最后按下回车 修改完毕。

> 参考：  
> 版权声明：本文为CSDN博主「Star-tears」的原创文章，遵循CC 4.0 BY-SA版权协议，转载请附上原文出处链接及本声明。  
> 原文链接：[https://blog.csdn.net/qq\\\_51173321/article/details/126287293](https://blog.csdn.net/qq%5C_51173321/article/details/126287293) 作者：黑马pink讲前端 [https://www.bilibili.com/read/cv9699783/?opus\_fallback=1](https://www.bilibili.com/read/cv9699783/?opus_fallback=1) 出处：bilibili