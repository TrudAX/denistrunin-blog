---
title: "Execute direct SQL in D365FO database"
date: "2020-07-29T22:12:03.284Z"
tags: ["XppTools"]
path: "/xpptools-sqlexecute"
featuredImage: "./logo.png"
excerpt: "'Execute direct SQL' form provide a simple interface to execute SQL commands in D365FO database."
---

'Execute direct SQL' is a simple form that allows to write and execute direct SQL from the browser against D365FO database. It can save time in debugging and troubleshooting.

The original idea was introduced in **AX Paradise** [blog post](https://axparadise.com/sql-access-on-production-in-d365fo/#page-content), I added some improvements and included it to my list of tools.

## How to work with this form

To use this form, you need to go to Administration-Inquiries, and run **Execute SQL form**.

![](DEVSQLQueryExecute.png)

It allows you enter **SQL text** to execute and outputs the execution results as **HTLM** or as a **File** when you press **Run** button. 

You can also limit the number of returned rows. Due to AX string manipulation and text formatting current output is quite slow, it can handle only about 100-1000 rows.

As direct SQL execution is a quite dangerous operation, I also added a second tab to this form that logs all executed commands, so you can always check who used it.

To limit the number of users who can use this tool I added a new role - aa

### Performance inquiry

One possible use case of this tool can be a performance troubleshooting for D365FO. Current tools in LCS are quite [slow](https://denistrunin.com/performance-sniffing) for cloud version. 

You can execute commands like getting [TOP SQL](https://github.com/TrudAX/TRUDScripts/blob/master/Performance/AX%20Technical%20Audit.md#get-top-sql) without direct connection to SQL Server.

![](TopSQL.png)

You can also download and analyse SQL plan using the following command:



However, I don't know will this work for production instances. If you can test it, ping me with the results. If it doesn't work, probably we should create an Idea to allow this(at least until LCS views will be fixed). For a list of queries check Glenn Berry's monthly update of [Azure SQL Database Diagnostic Information Queries](https://github.com/ktaranov/sqlserver-kit/blob/master/Scripts/Azure%20SQL%20Database%20Diagnostic%20Information%20Queries.sql)

## Summary

**Execute direct SQL** tool can simplify your troubleshooting experience. You can download it using the following link - [https://github.com/TrudAX/XppTools#installation](https://github.com/TrudAX/XppTools#installation)

Feel free to post any comments(better as a GitHub issue) or ideas, what else can be improved.
