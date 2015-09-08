---
layout: post
title:  "Building a Web Crawler with Scrapy"
date: 2015-09-08 21:37:36
author: hugoHOOVER
meta:
categories: jekyll update
---


> Scrapy是一个为了爬取网站数据，提取结构性数据而编写的应用框架。 
可以应用在包括数据挖掘，信息处理或存储历史数据等一系列的程序中。
其最初是为了页面抓取 (更确切来说, 网络抓取 )所设计的， 也可以应用在获取API所返回的数据(例如 Amazon Associates Web Services ) 或者通用的网络爬虫。
Scrapy用途广泛，可以用于数据挖掘、监测和自动化测试。

## intro Scrapy
Scrapy 使用了 Twisted异步网络库来处理网络通讯。

![整体架构](http://newtonblogimg.qiniudn.com/Scrapy%20Architecture.png)

Scrapy主要包括了以下组件：

- 引擎(Scrapy): 用来处理整个系统的数据流处理, 触发事务(框架核心)
- 调度器(Scheduler): 用来接受引擎发过来的请求, 压入队列中, 并在引擎再次请求的时候返回. 可以想像成一个URL（抓取网页的网址或者说是链接）的优先队列, 由它来决定下一个要抓取的网址是什么, 同时去除重复的网址
- 下载器(Downloader): 用于下载网页内容, 并将网页内容返回给蜘蛛(Scrapy下载器是建立在twisted这个高效的异步模型上的)
- 爬虫(Spiders): 爬虫是主要干活的, 用于从特定的网页中提取自己需要的信息, 即所谓的实体(Item)。用户也可以从中提取出链接,让Scrapy继续抓取下一个页面
- 项目管道(Pipeline): 负责处理爬虫从网页中抽取的实体，主要的功能是持久化实体、验证实体的有效性、清除不需要的信息。当页面被爬虫解析后，将被发送到项目管道，并经过几个特定的次序处理数据。
- 下载器中间件(Downloader Middlewares): 位于Scrapy引擎和下载器之间的框架，主要是处理Scrapy引擎与下载器之间的请求及响应。
- 爬虫中间件(Spider Middlewares): 介于Scrapy引擎和爬虫之间的框架，主要工作是处理蜘蛛的响应输入和请求输出。
- 调度中间件(Scheduler Middewares): 介于Scrapy引擎和调度之间的中间件，从Scrapy引擎发送到调度的请求和响应。

运行流程大概如下：

1. 首先，引擎从调度器中取出一个链接(URL)用于接下来的抓取
2. 引擎把URL封装成一个请求(Request)传给下载器，下载器把资源下载下来，并封装成应答包(Response)
3. 然后，爬虫解析Response
4. 若是解析出实体（Item）,则交给实体管道进行进一步的处理。
5. 若是解析出的是链接（URL）,则把URL交给Scheduler等待抓取

## installation

    sudo pip install virtualenv  #安装虚拟环境工具
    virtualenv ENV  #创建一个虚拟环境目录
    source ./ENV/bin/active  #激活虚拟环境
    pip install Scrapy
    #验证是否安装成功
    pip list
    #输出如下
    cffi (1.2.1)
    characteristic (14.3.0)
    cryptography (1.0.1)
    cssselect (0.9.1)
    enum34 (1.0.4)
    idna (2.0)
    ipaddress (1.0.14)
    lxml (3.4.4)
    pip (7.0.3)
    pyasn1 (0.1.8)
    pyasn1-modules (0.0.7)
    pycparser (2.14)
    pyOpenSSL (0.15.1)
    queuelib (1.3.0)
    Scrapy (1.0.3)
    service-identity (14.0.0)
    setuptools (17.0)
    six (1.9.0)
    Twisted (15.4.0)
    w3lib (1.12.0)
    wheel (0.24.0)
    zope.interface (4.1.2)
    (ENV)

## Tutorial
在抓取之前, 你需要新建一个Scrapy工程. 进入一个你想用来保存代码的目录，然后执行：

    scrapy startproject tutorial  #在当前目录下创建一个新目录 tutorial

其中包括的文件主要是：

- scrapy.cfg: 项目配置文件
- tutorial/: 项目python模块, 之后您将在此加入代码
- tutorial/items.py: 项目items文件
- tutorial/pipelines.py: 项目管道文件
- tutorial/settings.py: 项目配置文件
- tutorial/spiders: 放置spider的目录

### define `Item`
Items是将要装载抓取的数据的容器，它工作方式像 python 里面的字典，但它提供更多的保护，比如对未定义的字段填充以防止拼写错误.

通过创建`scrapy.Item类`, 并且定义类型为 `scrapy.Field` 的类属性来声明一个Item.
我们通过将需要的item模型化，来控制从 `dmoz.org` 获得的站点数据，比如我们要获得站点的名字，url 和网站描述，我们定义这三种属性的域。
在 `tutorial` 目录下的 `items.py` 文件编辑.

    from scrapy.item import Item, Field


    class DmozItem(Item):
        # define the fields for your item here like:
        name = Field()
        description = Field()
        url = Field()

### modifying `Spider`
Spider 是用户编写的类, 用于从一个域（或域组）中抓取信息, 定义了用于下载的URL的初步列表, 如何跟踪链接，以及如何来解析这些网页的内容用于提取items。

要建立一个 Spider，继承 scrapy.Spider 基类，并确定三个主要的、强制的属性：

- name：爬虫的识别名，它必须是唯一的，在不同的爬虫中你必须定义不同的名字.
- start_urls：包含了Spider在启动时进行爬取的url列表。因此，第一个被获取到的页面将是其中之一。后续的URL则从初始的URL获取到的数据中提取。我们可以利用正则表达式定义和过滤需要进行跟进的链接。
- parse()：是spider的一个方法。被调用时，每个初始URL完成下载后生成的 Response 对象将会作为唯一的参数传递给该函数。该方法负责解析返回的数据(response data)，提取数据(生成item)以及生成需要进一步处理的URL的 Request 对象。
- 这个方法负责解析返回的数据、匹配抓取的数据(解析为 item )并跟踪更多的 URL。

在 /tutorial/tutorial/spiders 目录下创建 dmoz_spider.py

    import scrapy

    class DmozSpider(scrapy.Spider):
        name = "dmoz"
        allowed_domains = ["dmoz.org"]
        start_urls = [
            "http://www.dmoz.org/Computers/Programming/Languages/Python/Books/",
            "http://www.dmoz.org/Computers/Programming/Languages/Python/Resources/"
        ]

        def parse(self, response):
            filename = response.url.split("/")[-2]
            with open(filename, 'wb') as f:
                f.write(response.body)

### 爬取


    scrapy crawl dmoz

### 提取Items
#### intro `Selector`
从网页中提取数据有很多方法。Scrapy使用了一种基于 XPath 或者 CSS 表达式机制： Scrapy Selectors

出XPath表达式的例子及对应的含义:

- /html/head/title: 选择HTML文档中 <head> 标签内的 <title> 元素
- /html/head/title/text(): 选择 <title> 元素内的文本
- //td: 选择所有的 <td> 元素
- //div[@class="mine"]: 选择所有具有class="mine" 属性的 div 元素

为了方便使用 XPaths，Scrapy 提供 Selector 类， 有四种方法 :

- xpath()：返回selectors列表, 每一个selector表示一个xpath参数表达式选择的节点.
- css() : 返回selectors列表, 每一个selector表示CSS参数表达式选择的节点
- extract()：返回一个unicode字符串，该字符串为XPath选择器返回的数据
- re()： 返回unicode字符串列表，字符串作为参数由正则表达式提取出来

#### 取出数据
首先使用谷歌浏览器开发者工具, 查看网站源码, 来看自己需要取出的数据形式(这种方法比较麻烦), 更简单的方法是直接对感兴趣的东西右键`审查元素`, 可以直接查看网站源码

在查看网站源码后, 网站信息在第二个<ul>内

,,,,,,