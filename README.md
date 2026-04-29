# 网页插件模板

一个通用的浏览器扩展插件模板项目，支持 Chrome、Firefox、Edge 等主流浏览器。

## 项目结构

```
├── manifest.json    # 插件配置文件（Manifest V3）
├── popup.html       # 点击插件图标弹出的页面
├── popup.css        # 弹出页面样式
├── popup.js         # 弹出页面逻辑
├── background.js    # 后台服务脚本
├── content.js       # 注入网页的内容脚本
├── content.css      # 注入网页的样式
└── README.md        # 项目说明文档
```

## 文件说明

| 文件 | 说明 |
|------|------|
| `manifest.json` | 插件的核心配置文件，定义插件名称、版本、权限等 |
| `popup.html/css/js` | 点击插件图标时显示的弹出窗口 |
| `background.js` | 后台运行的服务脚本，处理生命周期事件 |
| `content.js/css` | 注入到目标网页中的脚本和样式 |

## 如何在各大浏览器中安装使用

### 1. Google Chrome / Microsoft Edge

#### 开发模式安装（未打包版本）

1. 打开浏览器，进入扩展管理页面：
   - **Chrome**: 地址栏输入 `chrome://extensions/`
   - **Edge**: 地址栏输入 `edge://extensions/`

2. 开启右上角的 **开发者模式** 开关

3. 点击 **加载已解压的扩展程序** 按钮

4. 选择本项目所在的文件夹（包含 `manifest.json` 的目录）

5. 安装成功后，插件图标会出现在浏览器工具栏

#### 打包发布版本

1. 在扩展管理页面，点击 **打包扩展程序**

2. 选择项目文件夹，生成 `.crx` 文件

3. 用户可以通过以下方式安装：
   - 直接拖拽 `.crx` 文件到浏览器窗口
   - 或通过 Chrome Web Store 发布后下载

---

### 2. Mozilla Firefox

#### 开发模式安装

1. 打开 Firefox，进入附加组件页面：
   - 地址栏输入 `about:debugging#/runtime/this-firefox`

2. 点击 **临时载入附加组件**

3. 选择项目文件夹中的 `manifest.json` 文件

4. 插件会临时安装，重启浏览器后需要重新加载

#### 打包发布版本

1. 需要创建 `.zip` 压缩包（包含所有文件）

2. 访问 [Firefox Add-ons Developer Hub](https://addons.mozilla.org/developers/)

3. 上传打包文件进行审核发布

---

### 3. Safari (macOS)

#### 开发模式安装

1. 打开 Safari 浏览器

2. 进入 **偏好设置** → **高级**，勾选 **在菜单栏中显示“开发”菜单**

3. 点击菜单栏 **开发** → **允许未签名的扩展**

4. 在项目目录中创建 `Info.plist` 文件（参考 Apple 文档）

5. 通过 Xcode 或 Safari 扩展构建工具进行打包

---

### 4. Opera

#### 开发模式安装

1. 打开 Opera，进入扩展管理页面：
   - 地址栏输入 `opera://extensions/`

2. 开启 **开发者模式**

3. 点击 **加载已解压的扩展**

4. 选择项目文件夹

---

## Manifest V3 说明

本项目使用 Manifest V3 标准，相比 V2 有以下改进：

- 使用 `service_worker` 替代 `background` 页面
- 更强的安全性和隐私保护
- 更严格的内容安全策略
- 性能优化

## 开发调试

### 调试 Popup 页面

1. 右键点击插件图标
2. 选择 **检查**
3. 打开开发者工具进行调试

### 调试 Background 脚本

1. 在扩展管理页面找到插件
2. 点击 **服务工作者** 链接
3. 打开后台脚本调试工具

### 调试 Content 脚本

1. 在任意网页中打开开发者工具
2. 在 `Sources` 面板中找到 `content.js`
3. 设置断点进行调试

## 插件权限说明

当前配置的权限：

- `activeTab`: 临时访问当前活动标签页
- `storage`: 使用浏览器本地存储
- `scripting`: 动态注入脚本
- `host_permissions`: 允许访问所有网站

根据实际需求，可以在 `manifest.json` 中修改权限配置。

## 常见问题

### Q: 插件安装后无法正常工作？

A: 请检查以下几点：
1. 确认已开启开发者模式
2. 检查 `manifest.json` 是否有语法错误
3. 查看浏览器控制台是否有错误信息

### Q: 如何更新插件？

A: 
1. 修改代码后，在扩展管理页面点击 **重新加载**
2. 或重新选择文件夹加载

### Q: 如何发布到应用商店？

A: 
- **Chrome**: 注册 [Chrome Web Store Developer](https://chrome.google.com/webstore/devconsole)
- **Firefox**: 注册 [Firefox Add-ons Developer](https://addons.mozilla.org/developers/)
- **Edge**: 通过 [Microsoft Edge Add-ons](https://partner.microsoft.com/en-us/dashboard/microsoftedge/)

## License

MIT License