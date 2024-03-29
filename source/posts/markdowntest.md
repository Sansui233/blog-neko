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

---

## Draft 属性

目前，在 yaml header 中，draft 属性设置为 false ，意思此 posts 将作为草稿，后续可能修订，不在 rss 中发布。

此举主要是考虑到，由于某些 rss 服务的缓存机制，一旦获取过旧的 rss 订阅，即便后续更新过内容，后续读者也不会获得更新的内容。这使得 rss 的发布相对网页发布而言更加正式。而我个人写博客的时候通常较为随意，会有挤牙膏式修订。

具体是否在网页上是标注为草稿待考量，~~设计太难了~~。

添加于 2023-08-30 日。 

## Code  HighLight

```rust
fn main() {
    let x = 1;
    let sum = |y: i32| { x + y }; // 说明： 闭包 sum 接收一个参数 y，且捕获前面的 x = 1, 返回 x + y
    println!("{}", sum(99)); // 输出 100

    let sum2 = |y :i32| x + y + 1; // 也可以省略花括号
    println!("{}", sum2(99)); // 输出 101
}
```

添加于 2023-09-15。

## Typography

排版，以功能性划分，而非纯粹的美学scaling划分。

很多时候web的一级标题应该独立设计，不是正文的一部分，仅作字号展示

# 很大很大的一级标题

## 很大的二级标题

分Section的功能，下面经常接的是正文或直接的三级标题

### 三级标题

正文，需要和二级标题在远距离明显区分

#### 四级标题

正文，一般不用

##### 五级标题

正文，一般不用

###### 六级标题

正文，图一乐。下面是夹杂在正文中的列表。

- Item1
- Item2
- Item3

完毕