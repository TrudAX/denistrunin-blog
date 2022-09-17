---
title: "Understanding D365FO different Tiers performance"
date: "2022-05-17T22:12:03.284Z"
tags: ["Performance"]
path: "/performance-tiers"
featuredImage: "./logo.png"
excerpt: "The blog post describes performance differences between various enviroments Tiers in D365FO"
---

ERP system performance is always an important topic in system implementation. There are not much public availiable information related to D365FO hardware configuration, in this blog post I describe some cases that allows better to understand the performance basics.

## Different tiers and their performance

D365FO as a backend uses different databases types: **SQL Sever** for Tier1 and **SQL Server Azure** for Tier2+ and PROD. 

A **Performance testing** form allows to see the execution speed for different SQL queries. 



I used 10k rows instead of default 1k and run it on several clients/enviroments and got the following results



Let's discuss these results

- In operations that include a lot of small calls SQL Azure is slower(4-8 times) than a standard SQL Server. This probably happening due to a large latency. The difference looks dramatic(as typical X++ code often contains a lot of small selects statements), but in the latest releases Microsoft implemented a lot of caching classes, so for business operations it is not so critical in general

- No difference in bulk operations(like update_recordset). They are also much faster compared to individual operation(e.g. row by row update). You may often see an advice to use these bulk operations by default, but I recommend to avoid this. The main issue is that **update_recordset** and **delete_recordset** are blocking operations and may stop the whole system if used in wrong way. And for the cloud system if will be very hard to troubleshoot and fix that. I wrote an article regarding this (link) and my advice is to use them only if you can measure the business operation benefit.

- The fun fact is your laptop probably is more performant that a PROD instance of multi-million ERP system. Keep this in mind while discussing performance issues with Microsoft support

## Enviroment planning 

Let's discuss some considerations used for enviroments planning 

### Pricing

The actual price may depends of you agreements with Microsoft, but some indicative values are the following:

Pricing for a typical Tier1 is ~700$/month and billed hourly, Tier2 is 2000$/month and Tier5 ~8000$/month and billed monthly

### Tier1 or Tier2+ for long data load processes 

If we check the performance in most cases Tier1 will be faster than a Tier2, here are some tests for data load 

Another point to consider is a stability. Tier2 is a shared enviroment, you can even execute the following command and see who are your neiborths

Database may be migrated to different instance. (SQL Transilent). Or table may be reindexed by DAMS service during the large data load(it leads to cursor)

Some function may not handle such errors properly(on one projects with 10.0.21 DAMS actions stopped multithereaded DIXF job after 3 hours of execution)

### PROD performance

Microsoft may dynamically scale PROD database level depending on customer workload. The exact scale up/down criterias are unknows, but I saw some cases where PROD database was allocated even to a lower database tier than a standard Tier2 enviroment. So you need to be able to measure and compare the performance for critical operations to communicate with support properly. 

### Performance testing 

You will see this advice in every Microsoft presentation, if you need to measure performance, always use Tier2+ instances.

### Applications servers 

It seems now Applicatoins servers are standard VMs with the following specs: 4-cores CPUs and 16GB of RAM. You can't get a better AOSes, but Microsoft may add more servers if needed. 

LCS provides a view for AOS CPU load and AOSes free memory, so it is quite easy to check if you reach your capacity 



One of the AOS CPU intensive operation is a Data management import. For every recors it scans all record fields with all extensions in all modules that produses a huge workload on application server CPUs



## Summary

I described some measures related to different D365FO enviroemntal type performance.I hope you find this information useful. 

If you have Tier3-Tier5 availiable it will be great if you can share the Performance form results on these enviroments(with 10k records) and don't hesitate to contact me in case of any questions