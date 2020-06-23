---
title: "Implementing parallel batch processing in X++"
date: "2020-06-17T22:12:03.284Z"
tags: ["DEVTutorial", "Performance"]
path: "/xpptools-batchmultithread"
featuredImage: "./logo.png"
excerpt: "The post describes a utility that generates X++ code template for Data provider and Controller classes."
---

One of the powerful feature of Dynamics 365 Finance and Operations is a Batch framework. In this post I explain how you can work with tasks to optimize the performance of batch task

## Initial example 

Les's consider the following operation - a user dialog that process customer transactions and performs some operation at the end. 

![](SingleThreadBatch.png)



Logic is very simple - loop thought all specified customer transactions and call **process()** function. In our case it will sleep for the specified number of milliseconds

```csharp
public void run()
{
    //1. data preparation
    info(strFmt("%1 - Start operation", AifUtil::applyUserPreferredTimeZoneOffset(DateTimeUtil::utcNow())));

    //2. Query Processing
    this.runQueryProcessing();

    //3.final task
    info(strfmt("%2 - %1 record(s) processed", SysQuery::countTotal(queryRun),
 AifUtil::applyUserPreferredTimeZoneOffset(DateTimeUtil::utcNow())));
}
public void runQueryProcessing()
{
    while (queryRun.next())
    {
        CustTrans   custTrans = queryRun.get(tablenum(CustTrans));
        this.processRecord(custTrans);
    }
}
public void processRecord(CustTrans  _custTrans)
{
    //do some job using _custTrans and transDate
    sleep(taskSleepTimeMs);
}
```

Standard USMF demo company has 1700 customer transactions, so if we run this job in a user interface or in a batch with 200ms to process one transaction it will take 340 seconds

![](BatchResults.png)

https://usnconeboxax1aos.cloud.onebox.dynamics.com/?mi=SysClassRunner&cls=DEVTutorialBatchSingleThread&cmp=USMF

## Solution design principles

It is quite obvious that we can optimize this by running the code in parallel threads. What should be considering while designing a solution for this:

- A change should be simple and require minimum changes to the original class. We don't what to create new classes or new tables. 
- We can't run I single batch thread per transaction - it will create a lot of overhead for batch framework, so solution should allow to specify a maximum batch threads.
- Execution flow in batch or without batch should be exactly the same, better to avoid operations that can be run only in batch. 
- We should support the final task and it should be executed only once.

In most cases we(as a developer) should know how to split the load. In the example above we can split selected customer transaction by equal intervals, but the split function can be more complex(for example we may want to avoid running parallel tasks for the same customer in order to avoid blocking)

So the main idea is to introduce a new parameter **batchIdentifier** - list of split intervals and then run our logic for these intervals.

I created a base class **DEVTutorialBatchMultipleThreadBase** to incorporate this logic. If we have batchIdentifier specified - that means it is child class that needs to perform a calculation for this batchIdentifier. If the class executed with an empty batch identifiers - that means it is a main task that should split the load and create all task for each split key and the final task at the end

```csharp
class DEVTutorialBatchMultipleThreadBase extends RunBaseBatch
{
    public void run()
    {
        container               batchIdentifierCon;
        int                     i;
        ;
        if (batchIdentifier) //child task
        {
            if (batchIdentifier == this.finalTaskIdentifier())
            {
                this.runFinalTask();
            }
            else
            {
                this.runThreadTask();
            }        
        }
        else
        {
            this.runStartTask();

            batchIdentifier = this.finalTaskIdentifier();
            this.processThreadItem(true); //create the final task, we need a dependency, so create it in the beggining.
        
            batchIdentifierCon = this.getBatchIdentifiersRangeCon();
                
            for (i = 1; i <= conLen(batchIdentifierCon); i++)
            {
                batchIdentifier = conPeek(batchIdentifierCon, i);
        
                this.processThreadItem(false);        
            }

            if (finalTask)
            {
                if (this.isInBatch())
                {
                    batchHeader.save();
                }
                else
                {
                    finalTask.run();
                }
            }
        
        }        
    }
```

Method processThreadItem create the same instance of our class, call pack function. If process is executed in a batch mode it create a new **runtime** batch task, without batch it just run it.

## Multiple threads batch example

Let's change our class to multithread 

we need to implement 4 function - 

```csharp
public class DEVTutorialBatchMultipleThread extends DEVTutorialBatchMultipleThreadBase
{
public void runStartTask()
{
    //1. data preparation
    info(strFmt("%1 - Start operation", AifUtil::applyUserPreferredTimeZoneOffset(DateTimeUtil::utcNow())));
}
public void runThreadTask()
{
	//2. Query Processing
	QueryBuildDataSource  qBDS = queryRun.query().dataSourceTable(tablenum(CustTrans));
    qBDS.addRange(fieldnum(CustTrans, RecId)).value(batchIdentifier);
    while (queryRun.next())
    {
        CustTrans   custTrans = queryRun.get(tablenum(CustTrans));
        this.processRecord(custTrans);
    }
}
public void runFinalTask()
{
    //3.final task
    info(strfmt("%2 - %1 record(s) processed", SysQuery::countTotal(queryRun),
                AifUtil::applyUserPreferredTimeZoneOffset(DateTimeUtil::utcNow())));
}
    public container  getBatchIdentifiersRangeCon()
    {
        container  res;
        QueryRun   queryRunLocal = new QueryRun(queryRun.query());

        QueryBuildDataSource   qBDS = queryRunLocal.query().dataSourceTable(tablenum(CustTrans));
        int                    totalRecords, curRecord, recordsPerBatch;
        RecId                  fromRecId, toRecId;

        qBDS.sortClear();
        qBDS.addSortField(fieldnum(CustTrans, RecId));
        qBDS.addRange(fieldnum(CustTrans, RecId)).value(batchIdentifier);

        totalRecords = SysQuery::countTotal(queryRunLocal);
        recordsPerBatch = maxTaskCount > 0 ? totalRecords div maxTaskCount : totalRecords;        
        if (! recordsPerBatch)
        {
            recordsPerBatch = 1;
        }

        while (queryRunLocal.next())
        {
            CustTrans   custTrans = queryRunLocal.get(tablenum(CustTrans));
            if (! fromRecId) fromRecId = custTrans.RecId;

            curRecord++;
            toRecId = custTrans.RecId;
            if ((curRecord mod recordsPerBatch) == 0)
            {
                res += SysQuery::range(fromRecId, toRecId);
                fromRecId = 0;
                curRecord = 0;
            }            
        }        
        if (curRecord && fromRecId && toRecId) res += SysQuery::range(fromRecId, toRecId);
    }

    return res;
}
    
```



the following results

![Multiple Thread Result](MultipleThreadResult.png)



## Summary

You can download this "**DataContract class builder**" from the following link https://github.com/TrudAX/TRUDUtilsD365/releases. If you find that something is missing or can be improved, don't hesitate to leave a comment.
