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

> We will also speak about common performance myths and mistakes based on real-life scenarios.
>
> The main principle of the technical audit is to start from the highest level(that allow to identify the performance problem with the minimum effort) and continue by going more deeper in analysis. Described techniques was used for more than 10 customers with number of users between 50 to 500 and database site from 100GB to 1TB. In all these cases steps were the same and helped to solve the actual problems

# Current hardware analysis

The simplest task to start is to compare actual used hardware with specified in project technical design document. It  will be not good if you see design specifications like "8-core CPU". Such phases in technical design means that you don't have technical design. "8 cores" CPU can provide any performance level. Try to filter 8 core CPU on the Amazon, you will see a huge price difference (PICTURE HERE)

> > > One of the client complained about slow overall system performance. While comparing recommended hardware with the actual I have found that instead of 4 core 3.5GHz CPUs they had used 20 cores 2.0GHz CPU. Actual client intention was good, they thought that more cores means more performance, but in that case 4 cores was more than enough, but these should be the fast cores.
> >
> > Current recommendations
>
> For Ax2012 use the following guidance as a baseline 
>
> ## AOS and Terminal servers

For AOS and Terminal server - CPU with the single thread performance compared to Azure Dx V3 series. Memory - about 300-500MB per user

These are the average values. The current Intel CPU models gives you about 50% more speed than these D3 level. If you current CPU below these values upgrading your servers can give you some noticeable performance boost. web sites where you can check the performance level is CPU benchmark (you need to check single thread performance and total performance). If you don't like to comparing these numbers just search on Amazon or Ebay your current CPU cost.   

## SQL Server 

The same principles apply to SQL Server CPU, but they are not so simple. SQL Server is licensed by cores. For the wrong selected CPU model your licenses can cost more than the actual hardware. Check this article that explains all in details. The idea in general is that in every model line Intel has 4-core CPU with the maximum performance per core value, the more cores you get, the less performance per code will be, so you should not use CPUs with more cores than your system needed.

As AX is an OLTP system current CPU power for a SQL Server should allow  to process data from the certain amount of memory. The amount of this memory is whether the maximum amount supported by the SQL Server standard edition(64GB - pre 2016 and 128GB - for SQL 2016) or the maximum "active data" in the database. 

From the practical experience 2 * 4 core CPUs can easily handle 128GB memory. 2 * 8 cores can work with 512GB, if you need more memory probably it's time to think about 4 socket servers

### Storage system

Nowadays we have HDD, SSD, and M2 storage. The main difference is the number IOPS they can handle(very simple 1K+, 10k+ 100k+). So if you have some storage problem you can read the articles lile that (nubmer of iops) or just upgrade to the next level 