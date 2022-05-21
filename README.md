# 个人博客

https://sansui233.com

黑白简约风格。兼具设计感与可读性。基于 Next.js 重写。完善中。

使用 Next.js 重写，可以在保留原来 hexo 博客用法的简便性的的同时，增加更多随意的个人定制页面。~~顺便复习一下 React~~

## 使用
1. 把 md 文件放在 source/posts/ 目录下。  
  - yaml 头必须有 title, date, categories 和 tags。因为是自用没有写适配。  
  - date 字段格式为：2022-05-16 05:20:16
2. 把一个新的 md 文件放在 source/memos/ 目录下。  memo 用于短文吐槽（俗称灌水）， md 文件中的每一个二级标题生成一个 memo。memo 不会生成 rss。不想要这个模块从 header 中删掉相应元素就行。
3. 添加 `site.config.js`

```ts
export const SiteInfo = {
  domain: "https://sansui233.com", // used to generate rss at build time
  walineApi: serverAPI // Waline 评论系统后端地址
}
```

4. 很多地方是非配置，需要自行改动
5. 然后 `npm install`, `npm build`,`npm run start` 即可。  

## Progress

- [x] 基本框架完成
- [x] rss 完成
- [x] Dark Mode
- [x] 详细分类页
- [x] 分页渲染
- [ ] 评论接入
- [ ] 统计接入
- [ ] 动画优化
- [ ] （长期）设计、抠 Markdown 等







