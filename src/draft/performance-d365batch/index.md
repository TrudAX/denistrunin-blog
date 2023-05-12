---
title: "D365FO Performance issue - batch job stucked in Executing status"
date: "2021-05-27T22:12:03.284Z"
tags: ["Performance", "PowerBI", "Performance audit"]
path: "/performance-d365batch"
featuredImage: "./logo.png"
excerpt: "The blog post describes how D365FO batch framework handle errors and what kind on problem is may cause"
---

In the current versoion of Dynamics 365 for Finance and Operation Microsoft introduced slightly new batch job processing logic with several main changes 

- No dedicated AOS services 
- Batch retries consept

The consept is not complex and described in the following presentation, but may be very confusing when you see it in a real life. I will try to provide a sample class to demonstate it and discuss how it may affect real life batch processing and cause several issues

## Some theory behind this

I asked this question in my linkedIn page(thank you everyone who answered) and got the following results

I have the following run base class, what will be the execution time 

Only 4% answered correctly, the correct time will be 500 seconds. Feel free to download the sample class and play with it.

Let's discuss how this may happen 

D365FO batch job is executing in the cloud, so there is no guarantie that the execution will be sucessfull. The batch job may be migrated to a different Batch server or the SQL Database may be migrated to different pool. In both cases execution fails with the system error. To cover this cases Microsoft introduced Batch retried mechanism

So in our case the batch job starts on the specified time and after 60 seconds it generates the error. The batch framework checks the number of retries(and it will be 0) and compares this value with the maximum retries value(that is 5). So it desided to execute batch job again. It puts it into the queue(so the may be some delay between it started again). The total execution times will be around 500 seconds

The next interesting question will be - how many errors do you see in Batch job execution history for this long runnig batch job. And the answer is more confusing - you don't see any errors during execution and see only one last error at the end.



## Real-life scenaio

Let's discuss how this behaviour may affect D365FO batch job monitoring

### Batch job stuck in Executing

This is probably the most common case you may see. Imagine you have a very critical bath job that should have a predictable exection time of 1h. For example you you do some orders reservation at 6am and at 8am you warehouse starts processing these reserved orders. You did all performance testing and also have 1h between 7am-8am as a backup time. But you see the job Executing at 7am, Executing at 8am(where the problems begins), Executing at 9am(where call starting involving management). 

The reason for this may be very simple,  for example one of the orders has a new unit of measure that doesn't have a conversion setup. The batch job generates the error, D365FO batch framework desided to retry this job 5 times. The very confusing part that you don't see any errors in log, also if you ask Microsoft to check the top queries or servers load, they also will not see any unusual values.

The proper troubleshooting should probably check the number of retries, if it is more than 1, cancel the current execution, run it without a batch mode and see the error

### Email send procedure

This may be a second case. You have a report that should sends as a e-mail to the specified customers. You run it a a daily batch job that executes this report. Some day when there will be the problem with one e-mail some customers may get a 5 copies, and some - none  

Fixing this behaviour may be quite complex, on one project we implemented so called e-mail send log to track what was send and what was not.

### The opposite case - parrallel reservation

Sometimes people knows about this behavour and try to avoid it. 

As an example we can take Report as finished procedure. During the procedure the system tries to pick some items and it is a typical situation that there may not be enought onhand do do this picking. In this case the procedure generate the error(not enought onhand), but to prevent retries(that are not help in this case) the procedure marks batch job as Succeded. In general looks good.

But what may happens if you have several procedures in parrallel. They may find the same dimension for the re





## Conclusion

In this blog post I provided some samples on how to implement performance monitoring in Dynamics AX and analyse performance of Dynamics AX operations with Power BI. Sample files(xpo that contains log table, form and a helper class) can be found in the following [folder](https://github.com/TrudAX/TRUDScripts/tree/master/Performance/Jobs/TimeLogTable).

I hope you find this information useful. Don't hesitate to contact me in case of any questions or if you want to share your Dynamics AX/D365FO operations monitoring approach. 

