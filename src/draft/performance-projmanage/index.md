---
title: "Organizing Performance optimization project best practice"
date: "2020-05-07T22:12:03.284Z"
tags: ["Performance"]
path: "/performance-projmanage"
featuredImage: "./logo.png"
excerpt: "The blog post compares ways how to solve SQL performance problems caused by parameters sniffing for AX2009/AX2012 and cloud version Dynamics 365 for Finance and Operations"
---

performance-projmanage

We recently finished quite successful a performance optimization project and I want to share some 

Project overview 

The client was a big retail company running AX2009 for  about 10 years with 80 users and 1TB database size. With the COVID situation they saw some increases in their sales and the performance of AX2019 that was average before this became critical.

As a final result they saw a great improvements 

System stability was greatly improved, some measurable results:

![PerfResults](PerfResults.png)

In total we did 43 different performance tasks and the project length was 3 months. So these results were quite amazing 

From my side as a technical consultant the project flow and organization was great and contains all typical interaction types that exists in similar projects. The size due  to system complexity was above average(for example TechCon time was 45 days, that is more than probably 10-20 days on average) 

I want to describe the pieces of successful factors and common mistakes that I saw on other projects like this

## Performance project team

The typical project team should have the following people:

- IT manager
- Functional consultant
- Infrastructure manager
- SQL administrator
- Project manager 
- Technical consultant

One person can combine several roles but **all these roles** should be a part of the project.

The typical mistakes here:

### - No project manager allocated

Initially that seems reasonable, system is critically slow, you need just technical people who tell you what to do and not managers. But this become an important factor after that. 

A lot of performance tasks are complex, have no direct impact on users and in order to resolve require efforts from different people. Probably the most typical example here is a recurring batch job that tries to reserve quantity for open orders and some orders are old, never be reserved and the processing happens again and again. Or some integration task that tries to process wrong messages every time it runs and do not mark them with the error flag. 

Such tasks can produce a huge load to AOSes and SQL Server and quite complex to resolve. So you need to contact with business users, understand the reason for such multiple processing, find a solution, develop and text a fix(this can be complex for job that was developed 5 years ago and nobody want to touch it). So good project manager should allocate resources for tasks like this and control the execution 

Changes are 



## Conclusion

If you use the on-premise system(AX2009, AX2012) and have access to SQL Server, make sure that your administrators know how to diagnose and solve parameters sniffing issues. It may happen even for an old system, for example, a case from this blog happened to a seven year old system.

If you are in the cloud - vote for the [idea](https://experience.dynamics.com/ideas/idea/?ideaid=2a4ab902-5690-ea11-99e5-0003ff68aebe) to fix LCS Insights response time

Any comments are welcome
