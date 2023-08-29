---
title: Markdown 测试
date: 2023-08-30 02:54:34
categories: 其他
description: 测试 draft 属性
draft: true
tags: 
  - blog
---

此文件留做 Blog 开发的新 feature 测试文件。

----

## Draft属性

目前，在 yaml header 中，draft 属性设置为 false ，意思此 posts 将作为草稿，后续可能修订，不在 rss 中发布。

此举主要是考虑到，由于某些 rss 服务的缓存机制，一旦获取过旧的 rss 订阅，即便后续更新过内容，后续读者也不会获得更新的内容。这使得 rss 的发布相对网页发布而言更加正式。而我个人写博客的时候通常较为随意，会有挤牙膏式修订。

具体是否在网页上是标注为草稿待考量，~~设计太难了~~。

添加于 2023-08-30 日。