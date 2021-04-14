---
title: "Improve Dynamics AX 2009/2012 logistics performance by denormalizing InventSum table"
date: "2021-04-15T22:12:03.284Z"
tags: ["Performance","AX2012"]
path: "/ax2012-inventsumfields"
featuredImage: "./logo.png"
excerpt: "Describes a sample approach of improving Dynamics AX 2009/2012 performance by downgrading D365FO InventSum table change"
---

**InventSum** table(Oh-hand inventory) is one of the frequently used tables in AX2009, AX2012, D365FO logistics module. It is also often one of the top reasons for various performance problems due to a used tables schema. All quantities and an Item code is stored in **InventSum** table, but the actual dimension values are stored in **InventDim** table

![InventDimStructure](InventDimStructure.png)

A typical system request is to get on-hand data for an item with some dimension, for example, get the quantities of Item AA stored on warehouse WW1. And depending on the selectivity of these values, the system may use different execution plans. Very often executing such queries can lead to parameters sniffing and not optimal plans.

A typical resolution is to use literals in the query(the query will be slower and you need to maintain statistics) or providing plan hits, but these actions require time and constant monitoring from DBA

## Solution from the cloud

In D365FO Microsoft finally decided to resolve this problem and added all dimension fields into the **InventSum** table.

![D365FOStructure](D365FOStructure.png)

So SQL Server doesn't need to decide which table to scan first - **InventDim** or **InventSum**, there is only one table now. You probably need to tune the proper indexes, but it is a less complex task compared to choosing a proper execution plan.

Let's discuss how we can use the same approach to increase AX2009 or AX2012 performance.

## Improved version of InventSum table

To add new fields to **InventSum** table you need to change the following objects:

| Object                     | Change description                                           |
| -------------------------- | ------------------------------------------------------------ |
| InventSum table            | Add new fields. Override insert and update methods. Add required indexes |
| InventUpdateOnhand class   | Change updateInventSumSimple and sqlUpdateInventSumStr methods that uses direct SQL to update InventSum records |
| InventSumDelta             | Add new fields, Override insert and update methods           |
| InventSumDeltaAggr ..views | These views used to create InventSumDelta aggregated records |
| A new job                  | job to fill the initial data                                 |

(D365FO used SQL Triggers to fill these fields, but probably not the best solution)

After that, you need to find places where InventSum is used and change the filter using the following macro.

![FilterMacro](FilterMacro.png)

There is no unified framework for this, so I suggest running a Trace Parser for critical system operations and replacing only them.

## Testing the performance change

I tried to test the performance change on the standard AX2012 DEMO VM with the following job that calculates Item quantity per Location:

![TestPerfJob](TestPerfJob.png)

The VM doesn't have much data and in order to compare the difference I measured the number of logical reads to perform the original(with **InventDim** exists join) or improved version(just **InventSum** table) statements

![TestPerfResultSQL](TestPerfResultSQL.png)

I got the following results:

![TestPerfResult](TestPerfResult.png)

On the DEMO VM **InventSum** and **InventDim** tables have similar size, and even then the performance difference is 4x. But if you have a "growing" dimension(like Batch, Pallet, Serial number, LP) and run a  periodic **InventSum** cleanup, **InventDim** table size will be much bigger and the difference will be bigger. Another important advantage that these 2 tables join often causing parameters sniffing issues, and using just one table may automatically resolve some of them.

From the drawbacks point, you need to create several new indexes on **InventSum**. But these indexes will be updated only when a new dimension is created and not during regular quantities updates.

So I don't see any major drawbacks, except the one, that this modification not a part of the standard AX2012 application(that could save thousands of hours spent on various performance tasks)

## Summary

Adding fields to **InventSum** may improve AX2009/AX2012 performance and resolve some parameter sniffing issues. It is not a simple, first-priority modification and probably takes a week to implement, but may be considered if you plan to continue to use AX2009/AX2012 application. Also quite important that it is using a solution from D365FO, so will not cause any problems during the upgrade.

A sample code for AX2012 used in this post can be found [here](https://github.com/TrudAX/TRUDScripts/tree/master/Performance/Jobs/DataCleanup), it may be used as an initial template for a similar modification.

I hope you find this information useful. As always, if you see any improvements, suggestions or have some questions about this work don't hesitate to contact me.
