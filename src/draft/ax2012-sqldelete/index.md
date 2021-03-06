---
title: "Implementing Dynamics AX 2009/2012 database cleanup"
date: "2021-03-04T22:12:03.284Z"
tags: ["Performance","AX2012"]
path: "/ax2012-sqldelete"
featuredImage: "./logo.png"
excerpt: "Describes custom plan command that can increase AX2012 database synchronisation speed"
---

One of the tasks in Dynamics AX 2009/2012 system performance maintenance is performing a periodic database cleanup. In this blog post I describe a new framework for implementing such tasks and provide some examples. 

First let's discuss why do we need some custom code and pitfalls of the standard cleanup methods 

## A standard way to delete from a large table

There are a lot of standard cleanup procedures that using the following code to perform a delete

In order to delete records from a table you can use the following code

```csharp
while select MyBigTable
	where MyBigTable.CreatedDateTime < cleanupDate
{
	MyBigTable.delete();
}    
//need to add ttscontrol here, for example commint on every 100th record
```

 This approach can work for a small tables, but if we need to delete a lot of records, it takes a lot of time, producing a high load to the SQL server 

Another way to implement a delete is using a **delete_from** command 

```csharp
delete_from MyBigTable
	where MyBigTable.CreatedDateTime < cleanupDate;
```

this statement is fast, but the command delete_from can block the table while running, so you need to run it only during a system downtime.

also both these methods work only in one company and you need to run a cleanup job per company, that creates an overhead how to set it up.

In a lot of performance audit projects I asked people why they didn't run a standard cleanup procedures and typical answer was - we tried to run it a year ago, then it hangs, users started complained on system performance, and we stopped it

### Improved version of delete from a large table

Below you can find an improved version of implementing a delete command

```sql
IF OBJECT_ID('tempdb..#recordsToDelete') IS NOT NULL DROP TABLE #recordsToDelete
IF OBJECT_ID('tempdb..#temp_hash') IS NOT NULL DROP TABLE #temp_hash
CREATE TABLE #temp_hash (RECID   BIGINT)

declare @step int
declare @isLastStep int = 0;

WHILE (@isLastStep = 0)
BEGIN
    select top 100000 RECID into #recordsToDelete
    FROM [dbo].MyBigTable AS hashtbl            --TABLE HERE
    WHERE hashtbl.CREATEDDATETIME <(GETDATE() -30);

    IF (@@ROWCOUNT < 100000) SET @isLastStep = 1
    CREATE NONCLUSTERED INDEX [##_RECID] ON #recordsToDelete (RECID ASC)

    set @step= 0
    WHILE (@step < 100)
    BEGIN
        SET @step = @step + 1
        TRUNCATE TABLE #temp_hash
        INSERT INTO #temp_hash(RECID) SELECT TOP 5000 RECID FROM  #recordsToDelete;
        IF (@@ROWCOUNT = 0) break;
        --------------------------------------------------------------
        delete FROM [dbo].MyBigTable from [dbo].MyBigTable  AS hs  --TABLE HERE
        INNER JOIN #temp_hash AS JN ON hs.RECID = JN.RECID
        ----------------------------
        delete from #recordsToDelete from #recordsToDelete as dt inner join #temp_hash as dl   on dl.RECID =dt.RECID
    END
    DROP TABLE #recordsToDelete
END
DROP TABLE #temp_hash;
```

It performs delete in 2 steps. First it selects a large number of table clustered keys(100K) into a temporary table. Often it is set of RecIds. Then split it into a smaller sets(5K records) and perform a main table delete using a clustered key condition.

Such approach gives a following advantages:

- Delete command is not blocking other processes(as we using clustered key condition and do delete for a small number of records)
- It is much faster than a one by one record delete
- It doesn't require additional indexes (by CreatedDateTime) as the number of large selects is low
- You can stop it in any time without loosing the progress
- It works for all companies

In my tests the speed of such approach was only 40% slower than a  standard **DELETE FROM** command and it can be run without blocking users even for a highly used WMS tables in the middle of the day.

While doing 



Time to synchronise AX2012 database was always a pain point for production databases. Recently I found an interesting AxForum [topic]( https://translate.google.com/translate?hl=en&tab=TT&sl=ru&tl=en&u=http%3A%2F%2Faxforum.info%2Fforums%2Fshowthread.php%3Fp%3D418755%23post418755) by Masel that is probably worth sharing.

If you want to execute database synchronisation faster, you need to create the following plan guide in the main AX database(not the _model):

```SQL
DECLARE @stmt nvarchar(max);
DECLARE @params nvarchar(max);
EXEC sp_get_query_template
    N'select name, change_tracking_state_desc from sys.columns AS Cols inner join sys.fulltext_index_columns AS FTSCols inner join sys.fulltext_indexes as FTS on FTSCols.object_id = FTS.object_id on Cols.object_id = FTSCols.object_id where Cols.column_id = FTSCols.column_id and Cols.object_id = object_id(''SYSINETCSS'')',
    @stmt OUTPUT,
    @params OUTPUT;
select @stmt;
EXEC sp_create_plan_guide
    N'SyncTemplateGuide',
    @stmt,
    N'TEMPLATE',
    NULL,
    @params,
    N'OPTION(PARAMETERIZATION FORCED)';  
```

I tested this script on 2 different systems(the slow and fast one):

- AX2012R3 CU9, Database on HDD disks, CPU: E5-2630 2.3GHz
- AX2012R3 Feb2019, Database on SDD disks, CPU: Core i7-8700 3.5GHz

In both cases it gave a considerable synchronisation speed boost(about 300% for the fast system). You can see the sync time before and after applying this fix below:

![Compare the time](SyncGraph.png)

The technique of this optimization is quite unusual, by creating this plan_guide you disable SQL plan creation based on actual SQL statement parameters. It is in general very similar to X++ **forceplaceholders** command. AX database synchronisation process sends a lot of small requests, and excluding the plan creation step gives this performance effect.

Enjoy and thank Masel for sharing this.
