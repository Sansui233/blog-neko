# next-blog-paper

一个黑白简约风格的个人博客。兼具设计感与可读性。保留了原来 hexo 博客用法的简便性。

- 预览：https://sansui233.com

## Progress

- [x] 基本框架完成
- [x] rss 完成
- [x] Dark Mode
- [x] 详细分类页
- [x] 分页渲染
- [x] 评论接入
- [x] 统计接入
- [x] 站内搜索（异步框架）
- [ ] 动画优化（尤其 CSR 等待部分）
- [ ] （长期）设计、抠 Markdown 等
- [ ] build 时单独进行rss解析，增加build option配置文件
- [x] CSR 索引增量更新

## 使用
0. 下载此仓库

```sh
git clone --depth=1 https://github.com/Sansui233/next-blog-paper.git
```

1. 把 md 文件放在 source/posts/ 目录下。  
  - yaml 头必须有 `title`, `date`, `categories` 和 `tags`  
  - yaml 头可选项
    - `description` 描述，目前不出现在网页，用于补充 seo 信息，以及生成 rss 描述。
    - `keywords` 关键词，目前不出现在网页，用于 seo  
    - `draft` 布尔值，是否为草稿，目前不出现在网页，用于控制是否通过 rss 发布
    - 具体见 [source/posts](https://github.com/Sansui233/blog/tree/master/source/posts) 中的示例  
  - `date` 字段格式为：`2022-05-16 05:20:16`
2. 把一个新的 md 文件放在 source/memos/ 目录下。   
  - memo 用于短文吐槽（俗称灌水）， md 文件中的每一个二级标题生成一个 memo。除非更改 memo 的 yaml 头，否则 memo 不会生成新的 rss。  
  - 如果分割为多个文件，则按名称从大到小排序进行解析。  
  - 不想要这个模块从 [header](https://github.com/Sansui233/next-blog-paper/blob/master/components/Header.tsx) 中删掉相应元素就行。
3. 在工作目录下添加 `site.config.js`

```ts
export const siteInfo = {
  domain: "https://sansui233.com", // Used to generate rss at build time
  walineApi: serverAPI, // 可选项，Waline 评论系统后端地址
  GAId: "G-xxxxxx" // 可选项，Google Analytics id
}
```

4. `npm install`, `npm run build`,`npm run start` 即可。

5. 部署参考 deploy.sh，需要修改目标文件夹和 git push 的分支名。我个人使用的是 github pages，同时 vercel 拉取 github 的分支。

其他地方目前是写死配置，需要自行改动

## Thanks

- 框架：Next.js
- MDX parser: next-mdx-remote
- CSS 方案: styled-components
- 评论系统: [Waline](https://waline.js.org)
- 统计数据: Google Analytics
- 图标: iconmonstr，IcoMoon 字体生成工具
- 部署: github, vercel

