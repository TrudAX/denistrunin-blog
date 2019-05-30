Technical audit 

## Introduction

Are your Dynamics AX users complaining about slow system performance? You started the research, found many tips what to do and still don’t know where to start. 
In this post we discuss how to perform Dynamics AX technical audit to identify the source of performance problems.
We will consider the following areas:

- Current hardware analysis

- SQL Server settings and monitoring
  Blocking

- AOS settings

- X++ code optimization

We will also speak about common performance myths and mistakes based on real-life scenarios.

The main principle of the technical audit is to start from the highest level(that allow to identify the performance problem with the minimum effort) and continue by going more deeper in analysis. Described techniques was used for more than 10 customers with number of users between 50 to 500 and database site from 100GB to 1TB. In all these cases steps were the same and helped to solve the actual problems

# Current hardware analysis

The simplest task to start is to compare actual used hardware with specified in project technical design document. It will be not good if you see design specifications like "8-core CPU". Such phases in technical design means that you don't have technical design. "8 cores CPU" can means any performance level. Try to filter "8 core CPU" on the Amazon, you will see a huge price variation

![](CPUPrice.png)

And in this case price defines performance level, there will be noticeable changes of system working on 10$ CPU compared to 10K$ CPU. 

> One of the client complained about slow overall system performance. While comparing recommended hardware with the actual I have found that instead of 4 core 3.5GHz CPUs they had used 20 cores 2.0GHz CPU. Actual client intention was good, they thought that more cores means more performance, but in that case 4 cores was more than enough, but these should be the fast cores.

## Hardware recommendations

For Ax2012 use the following guidance as a baseline 

### AOS and Terminal servers

For AOS and Terminal server - CPU with the single thread performance compared to Azure Dv3 series. Memory - about 300-500MB per user

These are the average values. The current Intel CPU [models](https://www.cpubenchmark.net/singleThread.html) give you about 30-50% more speed than these Azure Dv3 level. 

![](E52673CPUMark.png)

If you current CPU below these D3 values upgrading your servers can give you some noticeable performance boost. <https://www.cpubenchmark.net/> is a web site where you can check the CPU performance level(you need to check single thread performance and total performance). If you don't like to comparing these numbers just search on Amazon or Ebay your current CPU price.   

### SQL Server 

The same principles apply to SQL Server CPU, but they are not so simple. SQL Server is licensed by cores. For the wrong selected CPU model your SQL Server licenses can cost more than the actual hardware. Check this [blog post](https://sqlperformance.com/2014/01/system-configuration/selecting-a-processor-for-sql-server-2014-1) that explains the process in details. It is old, but the idea in general is that in every model line Intel has 4-core CPU with the maximum performance per core value, the more cores you get, the less performance per core will be, so you should not use CPUs with more cores than your system needed.

As AX is an OLTP system current CPU power for a SQL Server should allow  to process data from the certain amount of memory. The amount of this memory is whether the maximum amount supported by the SQL Server standard edition(64GB - pre 2016 and 128GB - for SQL 2016) or the maximum "active data" in the database. 

From the practical experience modern 2 * 4 cores CPU can easily handle 128GB memory. 2 * 8 cores can work with 512GB, if you need more memory probably it's time to think about 4 socket servers

#### Storage system

Nowadays we have HDD, SSD, and NVMe storage. The main difference is the number IOPS they can handle(very simple 1K+, 20k+ 200k+). So if you have some storage problem you can just upgrade to the next level



## Analyzing database size

First thing to check is the current AX database size per table. You don't need exact size(that takes time to perform), but can get the size using the saved statistics by using sp_space_used(it is almost instant). This script provide you size per table. Copy the result to Excel and sort by size. Sometimes you see the picture like this

![](DataBaseSizeTopTables.png)

in this case a lot of space consumed by some temporary data and can be deleted

Check the number of closed records in InventSum. If most of the records are closed, removing them can considerable increase the performance

![](InventSumSize.png)

For example if you get the following results, you can drop closed records(the only problem here is that some reports, for example "Onhand by date" can use closed records to displays historic data, check this before delete)

Also check some table statistics(use these scripts) Often you need the following: 

- Transactions per day(for logistics companies it will be number of sales lines or invent trans per day) and the difference between peek and normal days)
- Active users per day, per hour 
- Batch jobs and their timings 

Compare these numbers with the numbers from the technical design, very often clients exceed them but "forget" to upgrade hardware.

## SQL server settings 

To check the current SQL server settings you need just 1 script - sp_Blitz, it performs thousands of checks and displays summarized recommendations with the explanation links

## AOS settings

There are number of blog posts that cover optimal settings for the AOS. 

<https://community.dynamics.com/365/financeandoperations/b/axsupport/archive/2014/09/05/ax-performance-troubleshooting-checklist-part-1b-application-and-aos-configuration> 

<https://blogs.msdn.microsoft.com/axinthefield/dynamics-ax-performance-step/> 



### Missing indexes

Missing indexes script provides overview of indexes that consider missed by the plan guide engine

You have the following columns here 

- Equality columns 
- Unequality columns

Don't just follow these recommendations, every recommendation should be analyzed from the logical point of view. You don't need analyze the whole output, often 30-50 top recommendations is enough 

PICTURE AND EXAMPLE HERE

### Unused indexes 

Script provides some unused indexes statistics from the large tables. Remove the indexes only if they are related to not used functionality or different country. In some special cases for the large tables you can also consider disabling Partition and DataArea.

### Wait statistics

Script gives you the percentage of current wait events. You you see some disk events here, analyze disk activity by disk and by file

PICTURE HERE 

### Top SQL analysis

Script provides the active top SQL commands, their statistics and plans from the SQL server statistics(to clear the list use DBCC FREEPROCCACHE command). Ideally you should know the 5-10 statements from this list and analyze the following

- They logically make sense for the current implementation - the number of executions and the statement itself covers current system functions. Very often I see some statement here caused by incorrect system setup or not used functionality
- They use optimal plans and indexes

### AX long SQL statements tracing 

You can enable tracing of the long SQL statements in the user options. Use this job to enable it for the all users. Often you need analyze statements with the executions time more than 2-5 seconds. The great advantage of having this in AX is that you see the stack trace of the statement. Also keep in mind that long time to execute can be caused by 2 reasons 

- Statement was heavy and takes long to execute 
- Statement was blocked by other session



## Blocking analysis 

Unwanted blocking can be caused by the following reasons

Usage group update operation(like update_recordset) in X++. Check this article(LINK HERE) that explains the problem in detail. To resolve this type you need either replace "update_recordset" with "while select forupdate" or adjust indexes 

Blocking escalation - if you modify more than 5000 record in one transactions sometimes SQL Server decides to escalate the blocking level. If you have a lot of memory, you can disable this behavior, but first check that you really need to update all records in one transaction.

Great instrument to deal with the blocking is to enable AX long SQL statements tracing(see above) - in this case you will see the statement, user and actual operation(by using X++ stack trace). 

From SQL Server side it is also useful to enable context_info(LINK HERE) for the SQL session, in this case you can link AX session with the SQL Server SPID.

The most challenging part of resolving blocking problems is to find operations that cause blocking. Great technique is to try search blocking on the test version. In this case you run the client, execute the operation(for example post the sales order) and put breakpoint to the last ttscommit statement for this operation. Then run another client and start executing  operations(like another sales order or journal posting). If you catch the blocking you can easily implement and test a fix for it.

###  Parameters sniffing

--

